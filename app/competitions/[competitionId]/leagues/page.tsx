// app/competitions/[competitionId]/leagues/page.tsx

import LeaguesWrapper from './LeaguesWrapper';

export default function LeaguesPage({
    params,
}: {
    params: { competitionId: string };
}) {
    return <LeaguesWrapper competitionId={params.competitionId} />;
}