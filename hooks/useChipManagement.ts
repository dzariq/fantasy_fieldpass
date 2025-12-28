import { UserTeam, Rules } from '@/types';

export const useChipManagement = (
    userTeam: UserTeam | null,
    setUserTeam: React.Dispatch<React.SetStateAction<UserTeam | null>>,
    currentMatchweek: number,
    rules: Rules | null,
    isLineupLocked: boolean,
    getCurrentMatchweekData: () => any
) => {
    const toggleTripleCaptain = () => {
        if (currentMatchweek < (rules?.matchweek || 1)) {
            alert('📜 Cannot toggle Triple Captain in past matchweek');
            return;
        }
        if (isLineupLocked && currentMatchweek === rules?.matchweek) {
            alert('⏰ Lineup locked - cannot toggle Triple Captain');
            return;
        }

        if (!userTeam) return;

        const currentData = getCurrentMatchweekData();
        const isActive = currentData?.record.triple || false;

        const tripleUsedCount = userTeam.team_data.filter(td => td.record.triple).length;
        const tripleLimit = rules?.triple || 4;

        if (!isActive && tripleUsedCount >= tripleLimit) {
            alert(`❌ Triple Captain limit reached! (${tripleUsedCount}/${tripleLimit} used)`);
            return;
        }

        setUserTeam(prevTeam => {
            if (!prevTeam) return prevTeam;

            const updatedTeamData = prevTeam.team_data.map(td => {
                if (td.matchweek !== currentMatchweek) return td;

                return {
                    ...td,
                    record: {
                        ...td.record,
                        triple: !td.record.triple
                    }
                };
            });

            return { ...prevTeam, team_data: updatedTeamData };
        });
    };

    const toggleBenchBoost = () => {
        if (currentMatchweek < (rules?.matchweek || 1)) {
            alert('📜 Cannot toggle Bench Boost in past matchweek');
            return;
        }
        if (isLineupLocked && currentMatchweek === rules?.matchweek) {
            alert('⏰ Lineup locked - cannot toggle Bench Boost');
            return;
        }

        if (!userTeam) return;

        const currentData = getCurrentMatchweekData();
        const isActive = currentData?.record.benchboost || false;

        const benchBoostUsedCount = userTeam.team_data.filter(td => td.record.benchboost).length;
        const benchBoostLimit = rules?.benchboost || 6;

        if (!isActive && benchBoostUsedCount >= benchBoostLimit) {
            alert(`❌ Bench Boost limit reached! (${benchBoostUsedCount}/${benchBoostLimit} used)`);
            return;
        }

        setUserTeam(prevTeam => {
            if (!prevTeam) return prevTeam;

            const updatedTeamData = prevTeam.team_data.map(td => {
                if (td.matchweek !== currentMatchweek) return td;

                return {
                    ...td,
                    record: {
                        ...td.record,
                        benchboost: !td.record.benchboost
                    }
                };
            });

            return { ...prevTeam, team_data: updatedTeamData };
        });
    };

    const toggleWildcard = () => {
        if (currentMatchweek < (rules?.matchweek || 1)) {
            alert('📜 Cannot toggle Wildcard in past matchweek');
            return;
        }
        if (isLineupLocked && currentMatchweek === rules?.matchweek) {
            alert('⏰ Lineup locked - cannot toggle Wildcard');
            return;
        }

        if (!userTeam) return;

        const currentData = getCurrentMatchweekData();

        if (currentData?.is_new) {
            alert('❌ Wildcard is not available for new teams!\nNew teams already have unlimited transfers.');
            return;
        }

        const isActive = currentData?.record.wildcard || false;

        const wildcardUsedCount = userTeam.team_data.filter(td => td.record.wildcard).length;
        const wildcardLimit = rules?.wildcard || 1;
        const wildcardRemaining = wildcardLimit - wildcardUsedCount;

        if (wildcardRemaining <= 0) {
            alert(`❌ Wildcard limit reached!\n\n${wildcardUsedCount}/${wildcardLimit} used\n\nNo wildcards remaining.`);
            return;
        }

        if (!isActive) {
            const confirmed = confirm(
                '⚠️ WILDCARD CONFIRMATION\n\n' +
                `📊 Status: ${wildcardRemaining}/${wildcardLimit} remaining\n\n` +
                '✅ Unlimited transfers for this matchweek\n' +
                '❌ CANNOT be undone once activated\n' +
                `❌ Only ${wildcardRemaining} wildcard(s) left for the season\n\n` +
                'Are you sure you want to activate Wildcard?'
            );

            if (!confirmed) {
                return;
            }
        } else {
            alert('⚠️ Wildcard is already active!\n\nWildcard cannot be deactivated once enabled.');
            return;
        }

        setUserTeam(prevTeam => {
            if (!prevTeam) return prevTeam;

            const updatedTeamData = prevTeam.team_data.map(td => {
                if (td.matchweek !== currentMatchweek) return td;

                return {
                    ...td,
                    record: {
                        ...td.record,
                        wildcard: true
                    }
                };
            });

            return { ...prevTeam, team_data: updatedTeamData };
        });

        alert(`🃏 Wildcard activated!\n\n✅ Unlimited transfers for this matchweek\n📊 ${wildcardRemaining - 1}/${wildcardLimit} wildcards remaining`);
    };

    return {
        toggleTripleCaptain,
        toggleBenchBoost,
        toggleWildcard
    };
};