import { Player, UserTeam, MatchweekData } from '@/types';

export const apiService = {
    async saveTeam(competitionId: string | undefined, userTeam: UserTeam) {
        const saveResponse = await fetch(
            `/api/teams/${competitionId}/${userTeam?.country_code.replace('+', '') || ''}${userTeam?.phone}`,
            {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userTeam),
            }
        );

        const data = await saveResponse.json();

        if (!saveResponse.ok) {
            throw new Error(data.error);
        }

        return data;
    },

    async fetchSavedTeam(competitionId: string | undefined, phone: string) {
        const response = await fetch(`/api/teams/${competitionId}/${phone}`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch saved team');
        }

        return await response.json();
    },

    async fetchRules(competitionId: string) {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_FANTASY_API_BASE_URL}/rules?competition_id=${competitionId}`
        );
        return await response.json();
    },

    async fetchPlayers(competitionId: string) {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_FANTASY_API_BASE_URL}/allplayers?competition_id=${competitionId}`
        );
        return await response.json();
    },

    async fetchTeams(competitionId: string) {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_FANTASY_API_BASE_URL}/allteams?competition_id=${competitionId}`
        );
        return await response.json();
    }
};

export const getTransferChanges = async (
    userTeam: UserTeam | null,
    currentMatchweek: number,
    competitionId: string | undefined,
    getSelectedPlayers: () => Player[]
) => {
    if (!userTeam) return { playersOut: [], playersIn: [] };

    const currentPlayers = getSelectedPlayers();
    const currentPlayerIds = new Set(currentPlayers.map(p => p.id));

    try {
        const savedTeamJson = await apiService.fetchSavedTeam(competitionId, userTeam.phone);

        let originalPlayers: Player[] = [];

        if (savedTeamJson && savedTeamJson.team_data && Array.isArray(savedTeamJson.team_data)) {
            const savedMatchweekData = savedTeamJson.team_data.find(
                (td: MatchweekData) => td.matchweek === currentMatchweek
            );

            if (savedMatchweekData && savedMatchweekData.picks) {
                originalPlayers = [
                    ...(savedMatchweekData.picks.gk || []),
                    ...(savedMatchweekData.picks.df || []),
                    ...(savedMatchweekData.picks.mf || []),
                    ...(savedMatchweekData.picks.st || []),
                    ...(savedMatchweekData.picks.subgk || []),
                    ...(savedMatchweekData.picks.sub || [])
                ];
            }
        }

        const originalPlayerIds = new Set(originalPlayers.map(p => p.id));

        const playersOut = originalPlayers.filter(p => !currentPlayerIds.has(p.id));
        const playersIn = currentPlayers.filter(p => !originalPlayerIds.has(p.id));

        return { playersOut, playersIn };
    } catch (error) {
        console.log('Failed to fetch saved team for transfer comparison');
        return { playersOut: [], playersIn: [] };
    }
};