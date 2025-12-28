interface SidePanelProps {
    isSidePanelOpen: boolean;
    userTeam: any;
    authCountryCode: string;
    authPhone: string;
    setShowProfileModal: (show: boolean) => void;
    router: any;
    competitionId: string | undefined;
    handleLogout: () => void;
}

export default function SidePanel({
    isSidePanelOpen,
    userTeam,
    authCountryCode,
    authPhone,
    setShowProfileModal,
    router,
    competitionId,
    handleLogout
}: SidePanelProps) {
    return (
        <aside className={`side-panel ${isSidePanelOpen ? 'open' : ''}`}>
            <div className="side-content">
                <div className="manager-card">
                    <div className="manager-info-item">
                        <span className="info-label">Manager</span>
                        <span className="info-value manager-name">{userTeam?.manager || 'Set Profile'}</span>
                    </div>
                    <div className="manager-info-item">
                        <span className="info-label">Team</span>
                        <span className="info-value team-name">{userTeam?.name || 'Set Profile'}</span>
                    </div>
                    <div className="manager-info-item">
                        <span className="info-label">Account</span>
                        <span className="info-value auth-phone">{authCountryCode} {authPhone}</span>
                    </div>
                    <button 
                        className="edit-profile-btn"
                        onClick={() => setShowProfileModal(true)}
                    >
                        ✏️ Edit Profile
                    </button>
                </div>

                <div className="nav-section">
                    <button
                        className="nav-link matches"
                        onClick={() => router.push(`/competitions/${competitionId}/matches`)}
                    >
                        <span className="nav-icon">⚽</span>
                        <span className="nav-text">Matches</span>
                    </button>
                    {userTeam && (
                        <>
                            <button
                                className="nav-link global"
                                onClick={() => router.push(`/global/${competitionId}`)}
                            >
                                <span className="nav-icon">🌍</span>
                                <span className="nav-text">Global</span>
                            </button>
                            <button
                                className="nav-link global"
                                onClick={() => router.push(`/competitions/${competitionId}/leagues`)}
                            >
                                <span className="nav-icon">🏆</span>
                                <span className="nav-text">Private Leagues</span>
                            </button>
                        </>
                    )}
                    <button
                        className="nav-link logout"
                        onClick={handleLogout}
                    >
                        <span className="nav-icon">🚪</span>
                        <span className="nav-text">Logout</span>
                    </button>
                </div>
            </div>
        </aside>
    );
}