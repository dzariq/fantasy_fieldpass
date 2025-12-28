import UserInfoClient from './UserInfoClient';

export default async function User({
    params,
}: {
    params: { teamId: string,competitionId: string };
}) {
    return (
        <UserInfoClient
            competitionId={params.competitionId}
            teamId={params.teamId}
        />
    );
}