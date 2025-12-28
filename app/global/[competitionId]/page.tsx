import GlobalInfoClient from './GlobalInfoClient';

export default async function GlobalInfo({
    params,
}: {
    params: { competitionId: string };
}) {
    return (
        <GlobalInfoClient
            competitionId={params.competitionId}
        />
    );
}