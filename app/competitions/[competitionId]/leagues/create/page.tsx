// app/competitions/[competitionId]/leagues/page.tsx

import CreateLeague from './CreateLeague';

export default function CreateLeaguesPage({
    params,
}: {
    params: { competitionId: string };
}) {
    return <CreateLeague competitionId={params.competitionId} />;
}