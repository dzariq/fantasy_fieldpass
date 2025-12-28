import { Player, Team } from '@/types';

interface PlayerProfileModalProps {
    player: Player;
    teamName: string;
    onClose: () => void;
}

export default function PlayerProfileModal({ player, teamName, onClose }: PlayerProfileModalProps) {
    return (
        <>
            {/* Backdrop */}
            <div className="modal-backdrop" onClick={onClose}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                    {/* Close Button */}
                    <button className="modal-close" onClick={onClose}>
                        ✕
                    </button>

                    {/* Player Image */}
                    <div className="profile-header">
                        <div className="profile-image">
                            <img 
                                src={process.env.NEXT_PUBLIC_FANTASY_DASHBOARD_URL + '/' +player.image_url || 'https://st4.depositphotos.com/9998432/22597/v/600/depositphotos_225976914-stock-illustration-person-gray-photo-placeholder-man.jpg'} 
                                alt={player.name}
                                onError={(e) => {
                                    e.currentTarget.src = 'https://st4.depositphotos.com/9998432/22597/v/600/depositphotos_225976914-stock-illustration-person-gray-photo-placeholder-man.jpg';
                                }}
                            />
                            {/* Team Logo Badge */}
                            {player.team_logo && (
                                <div className="team-logo-badge">
                                    <img 
                                        src={`${player.team_logo}`}
                                        alt={teamName}
                                        onError={(e) => {
                                            e.currentTarget.style.display = 'none';
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                        <div className="profile-name">
                            <h2>{player.name}</h2>
                            <p className="profile-team">{teamName}</p>
                        </div>
                    </div>

                    {/* Player Stats */}
                    <div className="profile-stats">
                        <div className="stat-row">
                            <div className="stat-item">
                                <span className="stat-label">Position</span>
                                <span className="stat-value position">{player.position}</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-label">Minutes Played</span>
                                <span className="stat-value minutes">{player.minutes_played || 0}'</span>
                            </div>
                        </div>

                        <div className="stat-row">
                            <div className="stat-item">
                                <span className="stat-label">Value</span>
                                <span className="stat-value price">${player.value}</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-label">MW Points</span>
                                <span className="stat-value points">{player.points || 0}</span>
                            </div>
                        </div>

                        <div className="stat-row full">
                            <div className="stat-item">
                                <span className="stat-label">Next Match</span>
                                <span className="stat-value">{player.next_match || 'TBA'}</span>
                            </div>
                        </div>

                        {/* Season Statistics */}
                        <div className="season-stats-section">
                            <h3 className="section-title">Season Statistics</h3>
                            
                            {/* Total Points - Featured */}
                            <div className="total-points-card">
                                <div className="total-points-icon">🏆</div>
                                <div className="total-points-info">
                                    <span className="total-points-label">Total Points</span>
                                    <span className="total-points-value">{player.total_points || 0}</span>
                                </div>
                            </div>

                            <div className="stats-grid">
                                <div className="stat-card">
                                    <div className="stat-icon">⚽</div>
                                    <div className="stat-info">
                                        <span className="stat-label">Goals</span>
                                        <span className="stat-value">{player.goals || 0}</span>
                                    </div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-icon">🎯</div>
                                    <div className="stat-info">
                                        <span className="stat-label">Assists</span>
                                        <span className="stat-value">{player.assists || 0}</span>
                                    </div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-icon">🟨</div>
                                    <div className="stat-info">
                                        <span className="stat-label">Yellow Cards</span>
                                        <span className="stat-value yellow">{player.yellow_cards || 0}</span>
                                    </div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-icon">🟥</div>
                                    <div className="stat-info">
                                        <span className="stat-label">Red Cards</span>
                                        <span className="stat-value red">{player.red_cards || 0}</span>
                                    </div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-icon">❌</div>
                                    <div className="stat-info">
                                        <span className="stat-label">Penalties Missed</span>
                                        <span className="stat-value">{player.penalty_missed || 0}</span>
                                    </div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-icon">🧤</div>
                                    <div className="stat-info">
                                        <span className="stat-label">Penalties Saved</span>
                                        <span className="stat-value">{player.penalty_saved || 0}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Actions Section */}
                        {player.actions && player.actions.length > 0 && (
                            <div className="stat-row full">
                                <div className="stat-item actions-container">
                                    <span className="stat-label">Match Actions</span>
                                    <div className="actions-list">
                                        {player.actions.map((action: any, index: number) => (
                                            <div key={index} className="action-item">
                                                <span className="action-icon">
                                                    {action.event_type === 'goal' && '⚽'}
                                                    {action.event_type === 'assist' && '🎯'}
                                                    {action.event_type === 'yellow_card' && '🟨'}
                                                    {action.event_type === 'red_card' && '🟥'}
                                                    {action.event_type === 'sub_in' && '↑'}
                                                    {action.event_type === 'sub_out' && '↓'}
                                                    {action.event_type === 'owngoal' && '⚽❌'}
                                                    {!['goal', 'assist', 'yellow_card', 'red_card', 'sub_in', 'sub_out', 'owngoal'].includes(action.event_type) && '📋'}
                                                </span>
                                                <span className="action-text">
                                                    {action.event_type.replace('_', ' ').toUpperCase()}
                                                    <br/>
                                                    <span className="stat-label">{action.match.toUpperCase()}</span>
                                                </span>
                                                {action.minute_in_match && (
                                                    <span className="action-minute">{action.minute_in_match}'</span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style jsx>{`
                .modal-backdrop {
                    position: fixed;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.8);
                    backdrop-filter: blur(4px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 9999;
                    padding: 1rem;
                    animation: fadeIn 0.2s ease-out;
                }

                .modal-content {
                    background: var(--bg-secondary);
                    border: 1px solid var(--border);
                    border-radius: var(--radius-lg);
                    max-width: 500px;
                    width: 100%;
                    max-height: 90vh;
                    overflow-y: auto;
                    position: relative;
                    animation: slideUp 0.3s ease-out;
                    z-index: 10000;
                }

                .modal-close {
                    position: absolute;
                    top: 1rem;
                    right: 1rem;
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    background: var(--bg-tertiary);
                    color: var(--text-primary);
                    font-size: 1.25rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all var(--transition-base);
                    z-index: 10001;
                    cursor: pointer;
                    border: none;
                }

                .modal-close:hover {
                    background: var(--accent);
                    transform: scale(1.1);
                }

                .profile-header {
                    padding: 2rem;
                    text-align: center;
                    border-bottom: 1px solid var(--border);
                }

                .profile-image {
                    width: 150px;
                    height: 150px;
                    margin: 0 auto 1rem;
                    border-radius: 50%;
                    overflow: hidden;
                    border: 4px solid var(--primary);
                    box-shadow: 0 4px 12px rgba(0, 255, 135, 0.3);
                    position: relative;
                }

                .profile-image img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                /* Team Logo Badge */
                .team-logo-badge {
                    position: absolute;
                    bottom: 5px;
                    right: 5px;
                    width: 45px;
                    height: 45px;
                    border-radius: 50%;
                    background: white;
                    border: 3px solid var(--primary);
                    box-shadow: 
                        0 4px 12px rgba(0, 0, 0, 0.4),
                        0 0 0 2px rgba(0, 255, 135, 0.3);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    overflow: hidden;
                    z-index: 5;
                    animation: logoFloat 3s ease-in-out infinite;
                }

                .team-logo-badge img {
                    width: 90%;
                    height: 90%;
                    object-fit: contain;
                    padding: 3px;
                }

                @keyframes logoFloat {
                    0%, 100% {
                        transform: translateY(0) scale(1);
                    }
                    50% {
                        transform: translateY(-3px) scale(1.05);
                    }
                }

                .profile-name h2 {
                    font-size: 1.75rem;
                    font-weight: 800;
                    color: var(--text-primary);
                    margin-bottom: 0.5rem;
                }

                .profile-team {
                    font-size: 1rem;
                    color: var(--text-secondary);
                    font-weight: 600;
                }

                .profile-stats {
                    padding: 1.5rem;
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }

                .stat-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1rem;
                }

                .stat-row.full {
                    grid-template-columns: 1fr;
                }

                .stat-item {
                    background: var(--bg-tertiary);
                    padding: 1rem;
                    border-radius: var(--radius-md);
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }

                .stat-label {
                    font-size: 0.75rem;
                    color: var(--text-muted);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    font-weight: 600;
                }

                .stat-value {
                    font-size: 1.25rem;
                    font-weight: 800;
                    color: var(--text-primary);
                }

                .stat-value.position {
                    color: var(--primary);
                }

                .stat-value.price {
                    color: #ffd700;
                }

                .stat-value.points,
                .stat-value.total-points {
                    color: var(--primary);
                }

                .stat-value.minutes {
                    color: #00b8ff;
                }

                .stat-value.yellow {
                    color: #ffd700;
                }

                .stat-value.red {
                    color: #ff4444;
                }

                /* Season Statistics Section */
                .season-stats-section {
                    margin-top: 0.5rem;
                    padding-top: 1rem;
                    border-top: 1px solid var(--border);
                }

                .section-title {
                    font-size: 1rem;
                    font-weight: 700;
                    color: var(--text-primary);
                    margin-bottom: 1rem;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                /* Total Points Featured Card */
                .total-points-card {
                    background: linear-gradient(135deg, rgba(0, 255, 135, 0.15) 0%, rgba(0, 204, 106, 0.1) 100%);
                    border: 2px solid rgba(0, 255, 135, 0.3);
                    border-radius: var(--radius-md);
                    padding: 1.25rem;
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    margin-bottom: 1rem;
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 12px rgba(0, 255, 135, 0.1);
                }

                .total-points-card:hover {
                    border-color: rgba(0, 255, 135, 0.5);
                    box-shadow: 0 6px 20px rgba(0, 255, 135, 0.2);
                    transform: translateY(-2px);
                }

                .total-points-icon {
                    font-size: 2.5rem;
                    min-width: 48px;
                    text-align: center;
                    animation: rotate 3s ease-in-out infinite;
                }

                @keyframes rotate {
                    0%, 100% {
                        transform: rotate(0deg);
                    }
                    50% {
                        transform: rotate(15deg);
                    }
                }

                .total-points-info {
                    display: flex;
                    flex-direction: column;
                    gap: 0.25rem;
                    flex: 1;
                }

                .total-points-label {
                    font-size: 0.875rem;
                    color: var(--text-muted);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    font-weight: 700;
                }

                .total-points-value {
                    font-size: 2rem;
                    font-weight: 900;
                    background: linear-gradient(135deg, var(--primary) 0%, #00cc6a 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    line-height: 1;
                }

                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 0.75rem;
                }

                .stat-card {
                    background: var(--bg-tertiary);
                    border: 1px solid var(--border);
                    border-radius: var(--radius-md);
                    padding: 0.875rem;
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    transition: all 0.3s ease;
                }

                .stat-card:hover {
                    border-color: var(--primary);
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0, 255, 135, 0.2);
                }

                .stat-icon {
                    font-size: 1.75rem;
                    min-width: 32px;
                    text-align: center;
                }

                .stat-info {
                    display: flex;
                    flex-direction: column;
                    gap: 0.25rem;
                    flex: 1;
                }

                .stat-card .stat-label {
                    font-size: 0.7rem;
                    line-height: 1;
                }

                .stat-card .stat-value {
                    font-size: 1.125rem;
                    line-height: 1;
                }

                /* Actions Styling */
                .actions-container {
                    gap: 0.75rem;
                }

                .actions-list {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }

                .action-item {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 0.75rem;
                    background: rgba(0, 0, 0, 0.2);
                    border-radius: 8px;
                    border: 1px solid rgba(255, 255, 255, 0.05);
                }

                .action-icon {
                    font-size: 1.5rem;
                    min-width: 30px;
                    text-align: center;
                }

                .action-text {
                    flex: 1;
                    font-size: 0.875rem;
                    font-weight: 600;
                    color: var(--text-primary);
                    text-transform: capitalize;
                }

                .action-minute {
                    font-size: 0.875rem;
                    font-weight: 700;
                    color: var(--primary);
                    background: rgba(0, 255, 135, 0.1);
                    padding: 0.25rem 0.5rem;
                    border-radius: 6px;
                }

                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @media (max-width: 640px) {
                    .modal-content {
                        max-height: 95vh;
                    }

                    .profile-header {
                        padding: 1.5rem;
                    }

                    .profile-image {
                        width: 120px;
                        height: 120px;
                    }

                    .team-logo-badge {
                        width: 38px;
                        height: 38px;
                        border-width: 2px;
                    }

                    .profile-name h2 {
                        font-size: 1.5rem;
                    }

                    .profile-stats {
                        padding: 1rem;
                    }

                    .stat-row {
                        gap: 0.75rem;
                    }

                    .stat-item {
                        padding: 0.75rem;
                    }

                    .stat-value {
                        font-size: 1.125rem;
                    }

                    .total-points-card {
                        padding: 1rem;
                    }

                    .total-points-icon {
                        font-size: 2rem;
                        min-width: 40px;
                    }

                    .total-points-value {
                        font-size: 1.75rem;
                    }

                    .stats-grid {
                        grid-template-columns: 1fr;
                        gap: 0.5rem;
                    }

                    .stat-card {
                        padding: 0.75rem;
                    }

                    .stat-icon {
                        font-size: 1.5rem;
                        min-width: 28px;
                    }

                    .stat-card .stat-value {
                        font-size: 1rem;
                    }

                    .action-item {
                        padding: 0.5rem;
                        gap: 0.5rem;
                    }

                    .action-icon {
                        font-size: 1.25rem;
                        min-width: 24px;
                    }

                    .action-text {
                        font-size: 0.8rem;
                    }

                    .action-minute {
                        font-size: 0.75rem;
                    }
                }
            `}</style>
        </>
    );
}