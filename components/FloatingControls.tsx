interface FloatingControlsProps {
    currentData: any;
    tripleRemaining: number;
    benchBoostRemaining: number;
    wildcardRemaining: number;
    toggleTripleCaptain: () => void;
    toggleBenchBoost: () => void;
    toggleWildcard: () => void;
}

export default function FloatingControls({
    currentData,
    tripleRemaining,
    benchBoostRemaining,
    wildcardRemaining,
    toggleTripleCaptain,
    toggleBenchBoost,
    toggleWildcard
}: FloatingControlsProps) {
    return (
        <div className="floating-controls">
            <div className="chips-compact">
                <button
                    className={`chip-compact ${currentData?.record.triple ? 'active' : ''}`}
                    onClick={toggleTripleCaptain}
                    title="Triple Captain"
                >
                    <span className="chip-icon-compact">👑</span>
                    <span className="chip-count">{tripleRemaining}</span>
                </button>

                <button
                    className={`chip-compact ${currentData?.record.benchboost ? 'active' : ''}`}
                    onClick={toggleBenchBoost}
                    title="Bench Boost"
                >
                    <span className="chip-icon-compact">⚡</span>
                    <span className="chip-count">{benchBoostRemaining}</span>
                </button>

                {!currentData?.is_new && (
                    <button
                        className={`chip-compact wildcard ${currentData?.record.wildcard ? 'active' : ''}`}
                        onClick={toggleWildcard}
                        disabled={currentData?.record.wildcard}
                        title="Wildcard"
                    >
                        <span className="chip-icon-compact">🃏</span>
                        <span className="chip-count">{currentData?.record.wildcard ? '✓' : wildcardRemaining}</span>
                    </button>
                )}
            </div>
        </div>
    );
}