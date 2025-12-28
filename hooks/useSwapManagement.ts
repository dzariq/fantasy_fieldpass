import { useState } from 'react';
import { Player, UserTeam, Rules } from '@/types';

export const useSwapManagement = (
    userTeam: UserTeam | null,
    setUserTeam: React.Dispatch<React.SetStateAction<UserTeam | null>>,
    currentMatchweek: number,
    rules: Rules | null,
    isLineupLocked: boolean
) => {
    const [swapMode, setSwapMode] = useState(false);
    const [swapSourcePlayer, setSwapSourcePlayer] = useState<Player | null>(null);

    const handleSwapPlayer = (player: Player) => {
        if (currentMatchweek < (rules?.matchweek || 1)) {
            alert('📜 Cannot swap players in past matchweek');
            return;
        }
        if (isLineupLocked && currentMatchweek === rules?.matchweek) {
            alert('⏰ Lineup locked - cannot swap players');
            return;
        }

        if (!userTeam) return;

        if (!swapMode) {
            setSwapMode(true);
            setSwapSourcePlayer(player);
            console.log('Swap mode activated. Selected:', player.name);
            return;
        }

        if (!swapSourcePlayer) {
            setSwapMode(false);
            return;
        }

        if (player.id === swapSourcePlayer.id) {
            setSwapMode(false);
            setSwapSourcePlayer(null);
            alert('⚠️ Swap cancelled');
            return;
        }

        if (player.position !== swapSourcePlayer.position) {
            alert(`❌ Cannot swap ${swapSourcePlayer.position} with ${player.position}!`);
            setSwapMode(false);
            setSwapSourcePlayer(null);
            return;
        }

        console.log('Swapping:', swapSourcePlayer.name, '↔', player.name);

        setUserTeam(prevTeam => {
            if (!prevTeam) return prevTeam;

            const updatedTeamData = prevTeam.team_data.map(td => {
                if (td.matchweek !== currentMatchweek) return td;

                const newPicks = {
                    formation: td.picks.formation,
                    gk: [...td.picks.gk],
                    df: [...td.picks.df],
                    mf: [...td.picks.mf],
                    st: [...td.picks.st],
                    subgk: [...td.picks.subgk],
                    sub: [...td.picks.sub]
                };

                let sourceLocation = '';
                let sourceIndex = -1;

                ['gk', 'df', 'mf', 'st', 'subgk', 'sub'].forEach(key => {
                    const arr = newPicks[key as keyof typeof newPicks] as Player[];
                    const idx = arr.findIndex(p => p.id === swapSourcePlayer.id);
                    if (idx !== -1) {
                        sourceLocation = key;
                        sourceIndex = idx;
                    }
                });

                let targetLocation = '';
                let targetIndex = -1;

                ['gk', 'df', 'mf', 'st', 'subgk', 'sub'].forEach(key => {
                    const arr = newPicks[key as keyof typeof newPicks] as Player[];
                    const idx = arr.findIndex(p => p.id === player.id);
                    if (idx !== -1) {
                        targetLocation = key;
                        targetIndex = idx;
                    }
                });

                if (sourceLocation && targetLocation && sourceIndex !== -1 && targetIndex !== -1) {
                    const sourceArr = newPicks[sourceLocation as keyof typeof newPicks] as Player[];
                    const targetArr = newPicks[targetLocation as keyof typeof newPicks] as Player[];

                    const tempPlayer = sourceArr[sourceIndex];
                    sourceArr[sourceIndex] = targetArr[targetIndex];
                    targetArr[targetIndex] = tempPlayer;

                    console.log('✅ Swap completed!');
                }

                return { ...td, picks: newPicks };
            });

            return { ...prevTeam, team_data: updatedTeamData };
        });

        setSwapMode(false);
        setSwapSourcePlayer(null);
        alert(`✅ Swapped ${swapSourcePlayer.name} ↔ ${player.name}`);
    };

    const cancelSwap = () => {
        setSwapMode(false);
        setSwapSourcePlayer(null);
    };

    return {
        swapMode,
        swapSourcePlayer,
        handleSwapPlayer,
        cancelSwap
    };
};