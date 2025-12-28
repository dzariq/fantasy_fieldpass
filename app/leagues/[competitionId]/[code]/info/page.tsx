import LeagueInfoClient from './LeagueInfoClient';

export default async function LeagueInfo({
    params,
}: {
    params: { code: string,competitionId: string };
}) {
    return (
        <LeagueInfoClient
            competitionId={params.competitionId}
            code={params.code}
        />
    );
}