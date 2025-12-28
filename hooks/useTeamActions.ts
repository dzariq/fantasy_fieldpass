import { UserTeam, Rules, Team } from '@/types';
import { apiService, getTransferChanges } from '@/services/apiService';

export const useTeamActions = (
    userTeam: UserTeam | null,
    setUserTeam: React.Dispatch<React.SetStateAction<UserTeam | null>>,
    currentMatchweek: number,
    rules: Rules | null,
    teams: Team[],
    competitionId: string | undefined,
    authPhone: string,
    authCountryCode: string,
    getCurrentMatchweekData: () => any,
    getSelectedPlayers: () => any[],
    getRemainingBudget: () => number,
    setIsLoading: (loading: boolean) => void
) => {
    const getTeamName = (teamId: number): string => {
        const team = teams.find(t => t.id === teamId);
        return team?.short_name || team?.name || '';
    };

    const handleProfileChange = async (field: string, value: string) => {
        setUserTeam(prev => prev ? { ...prev, [field]: value } : prev);
    };

    const validateTeam = async (): Promise<{ isValid: boolean; errors: string[]; }> => {
        const errors: string[] = [];
        const currentData = getCurrentMatchweekData();

        if (!currentData) {
            errors.push('No matchweek data found');
            return { isValid: false, errors };
        }

        const selectedPlayers = getSelectedPlayers();
        const picks = currentData.picks;

        if (selectedPlayers.length !== 15) {
            errors.push(`Squad must have exactly 15 players (current: ${selectedPlayers.length})`);
        }

        if (!userTeam?.country_code || userTeam.country_code.length === 0) {
            await handleProfileChange('country_code', authCountryCode);
        }
        
        if (!userTeam?.phone || userTeam.phone.length === 0) {
            await handleProfileChange('phone', authPhone);
        }

        if (!userTeam?.name || userTeam.name.length === 0 || 
            !userTeam?.manager || userTeam.manager.length === 0 || 
            !userTeam?.country_code || userTeam.country_code.length === 0 || 
            ((!userTeam?.phone || userTeam.phone.length === 0) && !authPhone)) {
            errors.push(`Please complete your profile`);
        }

        const positionCounts = {
            GK: picks.gk.length + picks.subgk.length,
            DF: picks.df.length + picks.sub.filter((p: any) => p.position === 'DF').length,
            MF: picks.mf.length + picks.sub.filter((p: any) => p.position === 'MF').length,
            ST: picks.st.length + picks.sub.filter((p: any) => p.position === 'ST').length
        };

        const limits = {
            GK: rules?.GK || 2,
            DF: rules?.DF || 5,
            MF: rules?.MF || 5,
            ST: rules?.ST || 3
        };

        if (positionCounts.GK !== limits.GK) {
            errors.push(`Need exactly ${limits.GK} Goalkeepers (current: ${positionCounts.GK})`);
        }
        if (positionCounts.DF !== limits.DF) {
            errors.push(`Need exactly ${limits.DF} Defenders (current: ${positionCounts.DF})`);
        }
        if (positionCounts.MF !== limits.MF) {
            errors.push(`Need exactly ${limits.MF} Midfielders (current: ${positionCounts.MF})`);
        }
        if (positionCounts.ST !== limits.ST) {
            errors.push(`Need exactly ${limits.ST} Strikers (current: ${positionCounts.ST})`);
        }

        if (getRemainingBudget() < 0) {
            errors.push(`Over budget by $${Math.abs(getRemainingBudget())}`);
        }

        const teamCounts = new Map<number, number>();
        selectedPlayers.forEach((p: any) => {
            teamCounts.set(p.team_id, (teamCounts.get(p.team_id) || 0) + 1);
        });

        const maxSameClub = rules?.max_same_club || 3;
        teamCounts.forEach((count, teamId) => {
            if (count > maxSameClub) {
                const teamName = getTeamName(teamId);
                errors.push(`Too many players from ${teamName} (max: ${maxSameClub}, current: ${count})`);
            }
        });

        const startingXI = picks.gk.length + picks.df.length + picks.mf.length + picks.st.length;
        if (startingXI !== 11) {
            errors.push(`Starting XI must have exactly 11 players (current: ${startingXI})`);
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    };

    const syncUpstream = async () => {
        try {
            setIsLoading(true);
            await apiService.saveTeam(competitionId, userTeam!);
        } catch (error: any) {
            alert(error.message);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const saveTeam = async () => {
        const confirmed = confirm('Are you sure you want to save changes?');

        if (!confirmed) {
            return;
        }

        if (!userTeam) {
            alert('❌ No team data to save');
            return;
        }

        if (currentMatchweek !== rules?.matchweek) {
            alert('⚠️ Can only save team for current active matchweek!\nPlease navigate to Matchweek ' + rules?.matchweek);
            return;
        }

        const validation = await validateTeam();
        if (!validation.isValid) {
            alert('❌ Cannot save incomplete team!\n\n' + validation.errors.join('\n'));
            return;
        }

        const currentData = getCurrentMatchweekData();
        if (!currentData) {
            alert('❌ No matchweek data found');
            return;
        }

        const { playersOut, playersIn } = await getTransferChanges(
            userTeam,
            currentMatchweek,
            competitionId,
            getSelectedPlayers
        );

        const existingTransfers = currentData.record.transfers || [];
        const newTransfersCount = Math.max(playersOut.length, playersIn.length);
        const totalTransfers = existingTransfers.length + newTransfersCount;

        if (!currentData.is_new && !currentData.record.wildcard) {
            const transferLimit = rules?.transfer || 0;

            if (totalTransfers > transferLimit) {
                alert(`❌ Transfer limit exceeded!\nExisting transfers: ${existingTransfers.length}\nNew transfers: ${newTransfersCount}\nTotal: ${totalTransfers}\nLimit: ${transferLimit}\n\nPlease undo some transfers before saving.`);
                return;
            }
        }

        const newTransfers = playersOut.map((playerOut, index) => ({
            out: playerOut.id,
            in: playersIn[index]?.id || 0,
            time: Math.floor(Date.now() / 1000)
        }));

        if (playersIn.length > playersOut.length) {
            for (let i = playersOut.length; i < playersIn.length; i++) {
                newTransfers.push({
                    out: 0,
                    in: playersIn[i].id,
                    time: Math.floor(Date.now() / 1000)
                });
            }
        }

        try {
            const updatedUserTeam = {
                ...userTeam,
                team_data: userTeam.team_data.map(td => {
                    if (Number(td.matchweek) !== Number(currentMatchweek)) return td;

                    return {
                        ...td,
                        record: {
                            ...(td.record ?? {}),
                            transfers: [
                                ...(td.record?.transfers ?? []),
                                ...newTransfers
                            ]
                        }
                    };
                })
            };

            setUserTeam(updatedUserTeam);
            await syncUpstream();

            if (newTransfers.length > 0) {
                const transferSummary = `Transfers made: ${newTransfers.length}\n` +
                    `Players out: ${playersOut.map(p => p.name).join(', ') || 'None'}\n` +
                    `Players in: ${playersIn.map(p => p.name).join(', ') || 'None'}`;

                if (currentData.is_new) {
                    alert(`✅ Team saved successfully!\n\n${transferSummary}\n\n♾️ New team - Unlimited transfers!`);
                } else {
                    alert(`✅ Team saved successfully!\n\n${transferSummary}`);
                }
            } else {
                alert(`✅ Team saved successfully!`);
            }
        } catch (error) {
            alert('❌ Failed to save team');
        }
    };

    const resetToSavedTeam = async () => {
        try {
            const savedTeamJson = await apiService.fetchSavedTeam(competitionId, userTeam?.phone || '');

            if (!savedTeamJson) {
                alert('ℹ️ No saved team found in API.\nYou are already using the default data.');
                return;
            }

            const confirmed = confirm('⚠️ Reset to last saved team?\n\nThis will discard all unsaved changes for the current matchweek.');

            if (confirmed) {
                setUserTeam(savedTeamJson);
                alert('✅ Team reset to last saved state!');
            }
        } catch (error) {
            alert('❌ Failed to reset team');
        }
    };

    return {
        saveTeam,
        resetToSavedTeam,
        validateTeam,
        handleProfileChange
    };
};