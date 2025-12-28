import { Player, UserTeam, Rules } from '@/types';

export const useCaptainManagement = (
    userTeam: UserTeam | null,
    setUserTeam: React.Dispatch<React.SetStateAction<UserTeam | null>>,
    currentMatchweek: number,
    rules: Rules | null,
    isLineupLocked: boolean
) => {
    const toggleCaptain = (player: Player) => {
        if (currentMatchweek < (rules?.matchweek || 1)) {
            alert('📜 Cannot change captain in past matchweek');
            return;
        }
        if (isLineupLocked && currentMatchweek === rules?.matchweek) {
            alert('⏰ Lineup locked - cannot change captain');
            return;
        }

        if (!userTeam) return;

        setUserTeam(prevTeam => {
            if (!prevTeam) return prevTeam;

            const updatedTeamData = prevTeam.team_data.map(td => {
                if (td.matchweek !== currentMatchweek) return td;

                const clearCaptainFlags = (players: Player[]) =>
                    players.map(p => ({
                        ...p,
                        iscaptain: p.id === player.id
                            ? (p.iscaptain === 1 ? 0 : 1)
                            : 0,
                        isvicecaptain: p.id === player.id
                            ? 0 : p.isvicecaptain
                    }));

                return {
                    ...td,
                    picks: {
                        ...td.picks,
                        gk: clearCaptainFlags(td.picks.gk),
                        df: clearCaptainFlags(td.picks.df),
                        mf: clearCaptainFlags(td.picks.mf),
                        st: clearCaptainFlags(td.picks.st),
                        subgk: td.picks.subgk.map(p => ({ ...p, iscaptain: 0 })),
                        sub: td.picks.sub.map(p => ({ ...p, iscaptain: 0 }))
                    }
                };
            });

            return { ...prevTeam, team_data: updatedTeamData };
        });
    };

    const toggleViceCaptain = (player: Player) => {
        if (currentMatchweek < (rules?.matchweek || 1)) {
            alert('📜 Cannot change vice-captain in past matchweek');
            return;
        }
        if (isLineupLocked && currentMatchweek === rules?.matchweek) {
            alert('⏰ Lineup locked - cannot change vice-captain');
            return;
        }

        if (!userTeam) return;

        setUserTeam(prevTeam => {
            if (!prevTeam) return prevTeam;

            const updatedTeamData = prevTeam.team_data.map(td => {
                if (td.matchweek !== currentMatchweek) return td;

                const clearViceCaptainFlags = (players: Player[]) =>
                    players.map(p => ({
                        ...p,
                        isvicecaptain: p.id === player.id
                            ? (p.isvicecaptain === 1 ? 0 : 1)
                            : 0,
                        iscaptain: p.id === player.id
                            ? 0 : p.iscaptain
                    }));

                return {
                    ...td,
                    picks: {
                        ...td.picks,
                        gk: clearViceCaptainFlags(td.picks.gk),
                        df: clearViceCaptainFlags(td.picks.df),
                        mf: clearViceCaptainFlags(td.picks.mf),
                        st: clearViceCaptainFlags(td.picks.st),
                        subgk: td.picks.subgk.map(p => ({ ...p, isvicecaptain: 0 })),
                        sub: td.picks.sub.map(p => ({ ...p, isvicecaptain: 0 }))
                    }
                };
            });

            return { ...prevTeam, team_data: updatedTeamData };
        });
    };

    return {
        toggleCaptain,
        toggleViceCaptain
    };
};