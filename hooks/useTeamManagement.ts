import { useState, useEffect } from 'react';
import { Player, UserTeam, MatchweekData, Rules } from '@/types';
import { FORMATIONS } from '@/components/FormationSelector';

export const useTeamManagement = (
    userTeam: UserTeam | null,
    setUserTeam: React.Dispatch<React.SetStateAction<UserTeam | null>>,
    currentMatchweek: number,
    rules: Rules | null,
    authPhone: string,
    authCountryCode: string
) => {
    const getCurrentMatchweekData = (): MatchweekData | undefined => {
        if (!userTeam) return;
        return userTeam?.team_data.find(td => td.matchweek === currentMatchweek);
    };

    const getSelectedPlayers = (): Player[] => {
        const currentData = getCurrentMatchweekData();
        if (!currentData?.picks) return [];

        return [
            ...currentData.picks.gk,
            ...currentData.picks.df,
            ...currentData.picks.mf,
            ...currentData.picks.st,
            ...currentData.picks.subgk,
            ...currentData.picks.sub
        ];
    };

    const getRemainingBudget = (): number => {
        return userTeam?.credit || (rules?.credit || 1000);
    };

    const getTransfersRemaining = (): number => {
        const currentData = getCurrentMatchweekData();
        if (!currentData) return rules?.transfer || 0;

        if (currentData.is_new || currentData.record.wildcard) {
            return 999;
        }

        const transfersUsed = currentData.record.transfers.length;
        return Math.max(0, (rules?.transfer || 0) - transfersUsed);
    };

    const isPlayerSelected = (player: Player): boolean => {
        return getSelectedPlayers().some(p => p.id === player.id);
    };

    const canAddPlayer = (player: Player): boolean => {
        if (isPlayerSelected(player)) return false;

        const selectedPlayers = getSelectedPlayers();
        const currentData = getCurrentMatchweekData();
        if (!currentData) return false;

        if (player.value > getRemainingBudget()) return false;

        const picks = currentData.picks;
        const positionCounts = {
            GK: picks.gk.length + picks.subgk.length,
            DF: picks.df.length + picks.sub.filter(p => p.position === 'DF').length,
            MF: picks.mf.length + picks.sub.filter(p => p.position === 'MF').length,
            ST: picks.st.length + picks.sub.filter(p => p.position === 'ST').length
        };

        const limits = {
            GK: rules?.GK || 2,
            DF: rules?.DF || 5,
            MF: rules?.MF || 5,
            ST: rules?.ST || 3
        };

        if (positionCounts[player.position] >= limits[player.position]) return false;

        const sameTeamCount = selectedPlayers.filter(p => p.team_id === player.team_id).length;
        if (sameTeamCount >= (rules?.max_same_club || 3)) return false;

        if (selectedPlayers.length >= 15) return false;

        return true;
    };

    const addPlayer = (player: Player) => {
        if (!userTeam) return;

        setUserTeam(prevTeam => {
            if (!prevTeam) return prevTeam;

            const updatedTeamData = prevTeam.team_data.map(td => {
                if (td.matchweek !== currentMatchweek) return td;

                const newPicks = { ...td.picks };
                const formation = FORMATIONS.find(f => f.value === td.picks.formation) || FORMATIONS[0];

                if (player.position === 'GK') {
                    if (newPicks.gk.length < 1) {
                        newPicks.gk = [...newPicks.gk, player];
                    } else {
                        newPicks.subgk = [...newPicks.subgk, player];
                    }
                } else if (player.position === 'DF') {
                    if (newPicks.df.length < formation.df) {
                        newPicks.df = [...newPicks.df, player];
                    } else {
                        newPicks.sub = [...newPicks.sub, player];
                    }
                } else if (player.position === 'MF') {
                    if (newPicks.mf.length < formation.mf) {
                        newPicks.mf = [...newPicks.mf, player];
                    } else {
                        newPicks.sub = [...newPicks.sub, player];
                    }
                } else if (player.position === 'ST') {
                    if (newPicks.st.length < formation.st) {
                        newPicks.st = [...newPicks.st, player];
                    } else {
                        newPicks.sub = [...newPicks.sub, player];
                    }
                }

                return { ...td, picks: newPicks };
            });

            return { ...prevTeam, team_data: updatedTeamData };
        });
    };

    const removePlayer = (player: Player) => {
        if (!userTeam) return;

        setUserTeam(prevTeam => {
            if (!prevTeam) return prevTeam;

            const updatedTeamData = prevTeam.team_data.map(td => {
                if (td.matchweek !== currentMatchweek) return td;

                const newPicks = { ...td.picks };

                newPicks.gk = newPicks.gk.filter(p => p.id !== player.id);
                newPicks.df = newPicks.df.filter(p => p.id !== player.id);
                newPicks.mf = newPicks.mf.filter(p => p.id !== player.id);
                newPicks.st = newPicks.st.filter(p => p.id !== player.id);
                newPicks.subgk = newPicks.subgk.filter(p => p.id !== player.id);
                newPicks.sub = newPicks.sub.filter(p => p.id !== player.id);

                return { ...td, picks: newPicks };
            });

            return { ...prevTeam, team_data: updatedTeamData };
        });
    };

    const handleFormationChange = (newFormation: string, isLineupLocked: boolean) => {
        if (currentMatchweek < (rules?.matchweek || 1)) {
            alert('📜 This is a past matchweek - View only! Cannot change formation.');
            return;
        }

        if (currentMatchweek > (rules?.matchweek || 1)) {
            alert('🔮 Cannot change future matchweeks!');
            return;
        }

        if (isLineupLocked && currentMatchweek === rules?.matchweek) {
            alert('⏰ Deadline has passed! Cannot change formation for Matchweek ' + rules?.matchweek);
            return;
        }

        if (!userTeam) return;

        const formation = FORMATIONS.find(f => f.value === newFormation);
        if (!formation) return;

        setUserTeam(prevTeam => {
            if (!prevTeam) return prevTeam;

            const updatedTeamData = prevTeam.team_data.map(td => {
                if (td.matchweek !== currentMatchweek) return td;

                const allPlayers = [
                    ...td.picks.gk,
                    ...td.picks.df,
                    ...td.picks.mf,
                    ...td.picks.st,
                    ...td.picks.subgk,
                    ...td.picks.sub
                ];

                const gkPlayers = allPlayers.filter(p => p.position === 'GK');
                const dfPlayers = allPlayers.filter(p => p.position === 'DF');
                const mfPlayers = allPlayers.filter(p => p.position === 'MF');
                const stPlayers = allPlayers.filter(p => p.position === 'ST');

                const newPicks = {
                    formation: newFormation,
                    gk: gkPlayers.slice(0, 1),
                    df: dfPlayers.slice(0, formation.df),
                    mf: mfPlayers.slice(0, formation.mf),
                    st: stPlayers.slice(0, formation.st),
                    subgk: gkPlayers.slice(1),
                    sub: [
                        ...dfPlayers.slice(formation.df),
                        ...mfPlayers.slice(formation.mf),
                        ...stPlayers.slice(formation.st)
                    ]
                };

                return { ...td, picks: newPicks };
            });

            return { ...prevTeam, team_data: updatedTeamData };
        });
    };

    // Update budget when team changes
    useEffect(() => {
        if (!userTeam || !rules) return;

        const currentData = getCurrentMatchweekData();
        if (!currentData) return;

        const selectedPlayers = getSelectedPlayers();
        const totalSpent = selectedPlayers.reduce((sum, p) => sum + p.value, 0);
        const newCredit = (rules.credit || 1000) - totalSpent;

        if (userTeam.credit !== newCredit) {
            setUserTeam(prev => prev ? { ...prev, credit: newCredit } : prev);
        }
    }, [userTeam?.team_data, rules, currentMatchweek]);

    return {
        getCurrentMatchweekData,
        getSelectedPlayers,
        getRemainingBudget,
        getTransfersRemaining,
        isPlayerSelected,
        canAddPlayer,
        addPlayer,
        removePlayer,
        handleFormationChange
    };
};