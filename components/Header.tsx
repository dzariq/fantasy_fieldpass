import CountdownTimer from './CountdownTimer';

interface HeaderProps {
    showPlayerList: boolean;
    isSidePanelOpen: boolean;
    setIsSidePanelOpen: (open: boolean) => void;
    currentMatchweek: number;
    setCurrentMatchweek: (mw: number) => void;
    rules: any;
    calculateCurrentPoint: () => number;
    currentData: any;
    handleFormationChange: (formation: string) => void;
    isLineupLocked: boolean;
    saveTeam: () => void;
    resetToSavedTeam: () => void;
    getRemainingBudget: () => number;
    selectedPlayers: any[];
    getTransfersRemaining: () => number;
    calculateTotalPoints: () => number;
    checkDeadline: () => void;
}

export default function Header({
    showPlayerList,
    isSidePanelOpen,
    setIsSidePanelOpen,
    currentMatchweek,
    setCurrentMatchweek,
    rules,
    calculateCurrentPoint,
    currentData,
    handleFormationChange,
    isLineupLocked,
    saveTeam,
    resetToSavedTeam,
    getRemainingBudget,
    selectedPlayers,
    getTransfersRemaining,
    calculateTotalPoints,
    checkDeadline
}: HeaderProps) {
    return (
        <header className={`main-header ${showPlayerList ? 'hidden' : ''}`}>
            <div className="header-main">
                <div className="header-left">
                    <button
                        className="mobile-menu-btn"
                        onClick={() => setIsSidePanelOpen(!isSidePanelOpen)}
                    >
                        <span className="menu-icon">{isSidePanelOpen ? '✕' : '☰'}</span>
                    </button>

                    <h1 className="logo">
                        <span className="logo-icon">⚽</span>
                        <span className="logo-text">Fantasy</span>
                    </h1>

                    <div className="mw-compact">
                        <button
                            className="mw-btn"
                            onClick={() => setCurrentMatchweek(Math.max(1, currentMatchweek - 1))}
                            disabled={currentMatchweek === 1}
                        >
                            ←
                        </button>
                        <span className="mw-num">MW {currentMatchweek}</span>
                        <button
                            className="mw-btn"
                            onClick={() => setCurrentMatchweek(Math.min(rules?.matchweek || 1, currentMatchweek + 1))}
                            disabled={currentMatchweek >= (rules?.matchweek || 1)}
                        >
                            →
                        </button>
                        {rules?.matchweek !== currentMatchweek && (
                            <div className="stat-pill">
                                <span className="stat-icon">⭐</span>
                                <span className="stat-val points">{calculateCurrentPoint()}</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="header-right">
                    {currentData && currentMatchweek === rules?.matchweek && (
                        <select
                            className="formation-select-compact"
                            value={currentData?.picks.formation || '442'}
                            onChange={(e) => handleFormationChange(e.target.value)}
                            disabled={isLineupLocked}
                        >
                            <option value="442">4-4-2</option>
                            <option value="433">4-3-3</option>
                            <option value="451">4-5-1</option>
                            <option value="352">3-5-2</option>
                            <option value="343">3-4-3</option>
                            <option value="532">5-3-2</option>
                            <option value="541">5-4-1</option>
                        </select>
                    )}

                    {currentMatchweek === rules?.matchweek && currentData && (
                        <>
                            <button type="button" className="action-icon-btn save" onClick={saveTeam} title="Save">💾</button>
                            <button type="button" className="action-icon-btn reset" onClick={resetToSavedTeam} title="Reset">↺</button>
                        </>
                    )}
                </div>
            </div>

            {currentData && (
                <div className="stats-bar">
                    <div className="stat-pill">
                        <span className="stat-icon">💰</span>
                        <span className="stat-val budget">${getRemainingBudget()}</span>
                    </div>
                    <div className="stat-pill">
                        <span className="stat-icon">👥</span>
                        <span className="stat-val">{selectedPlayers.length}/15</span>
                    </div>
                    <div className="stat-pill">
                        <span className="stat-icon">🔄</span>
                        <span className="stat-val transfers">
                            {currentData?.is_new
                                ? '∞'
                                : currentData?.record.wildcard
                                    ? '∞'
                                    : getTransfersRemaining()}
                        </span>
                    </div>
                    <div className="stat-pill">
                        <span className="stat-icon">⭐</span>
                        <span className="stat-val points">{calculateTotalPoints()}</span>
                    </div>
                </div>
            )}

            {rules && currentMatchweek === rules.matchweek && (
                <div className="countdown-compact">
                    <CountdownTimer
                        deadline={rules.deadline}
                        matchweek={rules.matchweek}
                        onDeadlineReached={checkDeadline}
                    />
                </div>
            )}
        </header>
    );
}