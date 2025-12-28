import MatchesClient from './MatchesClient';

interface Match {
    id: number;
    home_club_id: number;
    away_club_id: number;
    home_club_name: string;
    away_club_name: string;
    home_club_logo: string;
    away_club_logo: string;
    home_score: number | null;
    away_score: number | null;
    date: number;
    time: string;
    venue: string;
    matchweek: number;
    status: 'scheduled' | 'live' | 'finished';
}

interface MatchesResponse {
    matches: Match[];
    competition_name: string;
    current_matchweek: number;
    total_matchweeks: number;
}

async function getMatches(competitionId: string): Promise<MatchesResponse> {
    try {
        const response = await fetch(
            `https://n8n.fieldpass.com.my/webhook/matches?competition_id=${competitionId}`,
            {
                cache: 'no-store', // Always fetch fresh data
            }
        );

        if (!response.ok) {
            throw new Error('Failed to fetch matches');
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching matches:', error);
        return {
            matches: [],
            competition_name: '',
            current_matchweek: 1,
            total_matchweeks: 1,
        };
    }
}

export default async function MatchesPage({
    params,
}: {
    params: { competitionId: string };
}) {
    const data = await getMatches(params.competitionId);
    return (
        <MatchesClient
            initialMatches={data.matches}
            competitionName={data.competition_name}
            currentMatchweek={data.current_matchweek}
            totalMatchweeks={data.total_matchweeks}
            competitionId={params.competitionId}
        />
    );
}