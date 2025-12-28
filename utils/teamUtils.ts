import { Player, UserTeam, MatchweekData, Rules, Team } from '@/types';

export const getTeamName = (teams: Team[], teamId: number): string => {
    const team = teams.find(t => t.id === teamId);
    return team?.short_name || team?.name || '';
};

export const calculateTotalPoints = (userTeam: UserTeam | null): number => {
    if (!userTeam) return 0;
    return userTeam.total_points || 0;
};

export const calculateCurrentPoint = (userTeam: UserTeam | null, currentMatchweek: number): number => {
    if (!userTeam) return 0;
    const currentData = userTeam.team_data.find(td => td.matchweek === currentMatchweek);
    return currentData?.points || 0;
};

export const getChipStats = (userTeam: UserTeam | null, rules: Rules | null) => {
    const tripleUsed = userTeam?.team_data.filter(td => td.record.triple).length || 0;
    const tripleLimit = rules?.triple || 4;
    const tripleRemaining = tripleLimit - tripleUsed;

    const benchBoostUsed = userTeam?.team_data.filter(td => td.record.benchboost).length || 0;
    const benchBoostLimit = rules?.benchboost || 6;
    const benchBoostRemaining = benchBoostLimit - benchBoostUsed;

    const wildcardUsed = userTeam?.team_data.filter(td => td.record.wildcard).length || 0;
    const wildcardLimit = rules?.wildcard || 1;
    const wildcardRemaining = wildcardLimit - wildcardUsed;

    return {
        tripleUsed,
        tripleLimit,
        tripleRemaining,
        benchBoostUsed,
        benchBoostLimit,
        benchBoostRemaining,
        wildcardUsed,
        wildcardLimit,
        wildcardRemaining
    };
};

export const createEmptyTeamTemplate = (currentMatchweek: number, rules: Rules | null): UserTeam => {
    return {
        entry_id: "",
        credit: rules?.credit || 0,
        manager: "",
        name: "",
        phone: "",
        country_code: "+60",
        team_data: [
            {
                matchweek: currentMatchweek,
                is_new: true,
                record: {
                    transfers: [],
                    triple: false,
                    benchboost: false,
                    wildcard: false,
                    points: 0
                },
                picks: {
                    formation: "442",
                    gk: [],
                    df: [],
                    mf: [],
                    st: [],
                    subgk: [],
                    sub: []
                }
            }
        ],
        total_points: 0,
    };
};

export const filterAndSortPlayers = (
    players: Player[],
    selectedPosition: string,
    selectedTeam: string,
    searchQuery: string,
    sortBy: string
): Player[] => {
    const filtered = players.filter(player => {
        const matchesPosition = selectedPosition === 'ALL' || player.position === selectedPosition;
        const matchesTeam = selectedTeam === 'ALL' || player.team_name === selectedTeam;
        const matchesSearch = player.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesPosition && matchesSearch && matchesTeam;
    });

    return [...filtered].sort((a, b) => {
        switch (sortBy) {
            case 'points':
                return (b.total_points || 0) - (a.total_points || 0);
            case 'goals':
                return (b.goals || 0) - (a.goals || 0);
            case 'assists':
                return (b.assists || 0) - (a.assists || 0);
            case 'value':
                return (b.value || 0) - (a.value || 0);
            case 'name':
            default:
                return a.name.localeCompare(b.name);
        }
    });
};