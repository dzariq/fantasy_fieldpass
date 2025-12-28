'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Team {
    rank: number;
    entry_id: string;
    name: string;
    manager: string;
    total_points: number;
}

interface GlobalInfoClientProps {
    competitionId: string;
}

export default function GlobalInfoClient({
    competitionId
}: GlobalInfoClientProps) {
    const router = useRouter();
    const [phone, setPhone] = useState('');
    const [teams, setTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);
    const [leagueName, setLeagueName] = useState('');
    const [startMw, setStartMw] = useState(0);
    const [endMw, setEndMw] = useState(0);
    const [myRank, setMyRank] = useState<number | null>(null);
    const [totalPlayers, setTotalPlayers] = useState<number>(0);

    useEffect(() => {
        async function fetchLeague() {
            const authData = localStorage.getItem('fantasy_auth');
            if (!authData) {
                return;
            }

            const { phone } = JSON.parse(authData);
            setPhone(phone);

            try {
                const response = await fetch('/api/leagues/global', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ competitionId, phone }),
                });
                
                if (response.ok) {
                    const data = await response.json();
                    console.log(data)
                    // Handle array response
                    const leagueData = Array.isArray(data) ? data[0] : data;
                    setTeams(leagueData.teams || []);
                    setLeagueName(leagueData.name || 'League Standings');
                    setStartMw(leagueData.start_mw || 1);
                    setEndMw(leagueData.end_mw || 38);
                    setMyRank(leagueData.rank || null);
                    setTotalPlayers(leagueData.total_players || 0);
                }
            } catch (error) {
                console.error('Error fetching standings:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchLeague();
    }, [competitionId]);

    const handleTeamClick = (entry_id: string) => {
        router.push(`/user/${competitionId}/${entry_id}`);
    };

    const getRankIcon = (rank: number) => {
        if (rank === 1) return '🥇';
        if (rank === 2) return '🥈';
        if (rank === 3) return '🥉';
        return `#${rank}`;
    };

    const getRankColor = (rank: number) => {
        if (rank === 1) return '#FFD700';
        if (rank === 2) return '#C0C0C0';
        if (rank === 3) return '#CD7F32';
        return '#7782ab';
    };

    const isMyTeam = (entry_id: string) => {
        return entry_id === phone;
    };

    if (loading) {
        return (
            <div className="standings-page">
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading standings...</p>
                </div>

                <style jsx>{`
                    .standings-page {
                        min-height: 100vh;
                        background: linear-gradient(180deg, #0a0e27 0%, #151a32 100%);
                        padding: 1rem;
                    }

                    .loading-state {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        min-height: 50vh;
                        gap: 1rem;
                    }

                    .spinner {
                        width: 48px;
                        height: 48px;
                        border: 4px solid rgba(0, 255, 135, 0.1);
                        border-top-color: var(--primary);
                        border-radius: 50%;
                        animation: spin 1s linear infinite;
                    }

                    @keyframes spin {
                        to { transform: rotate(360deg); }
                    }

                    .loading-state p {
                        color: var(--text-muted);
                        font-size: 0.9375rem;
                    }
                `}</style>
            </div>
        );
    }

    return (
        <div className="standings-page">
            {/* Header */}
            <header className="page-header">
                <button className="back-btn" onClick={() => router.back()}>
                    ← Back
                </button>
                <h1 className="page-title">Global Ranking</h1>
                <div className="league-meta">
                    <div className="league-duration">
                        <span className="duration-icon">📅</span>
                        <span>MW {startMw} - {endMw}</span>
                    </div>
                    {totalPlayers > 0 && (
                        <div className="league-duration">
                            <span className="duration-icon">👥</span>
                            <span>{totalPlayers.toLocaleString()} Teams</span>
                        </div>
                    )}
                </div>
            </header>

            {/* My Rank Card */}
            {myRank && (
                <div 
                    className="my-rank-card clickable"
                    onClick={() => handleTeamClick(phone)}
                >
                    <div className="rank-badge">
                        <span className="rank-icon">{getRankIcon(myRank)}</span>
                        <div className="rank-info">
                            <span className="rank-label">Your Rank</span>
                            <span className="rank-value">#{myRank}</span>
                        </div>
                    </div>
                    <div className="rank-stats">
                        <div className="stat">
                            <span className="stat-label">Out of</span>
                            <span className="stat-value">{totalPlayers.toLocaleString()}</span>
                        </div>
                        <div className="stat">
                            <span className="stat-label">Top</span>
                            <span className="stat-value">{totalPlayers > 0 ? Math.round((myRank / totalPlayers) * 100) : 0}%</span>
                        </div>
                    </div>
                    <div className="view-team-indicator">→</div>
                </div>
            )}

            {/* Podium - Top 3 */}
            {teams.length >= 3 && (
                <div className="podium-section">
                    <div className="podium">
                        {/* 2nd Place */}
                        <div 
                            className="podium-item second clickable"
                            onClick={() => handleTeamClick(teams[1].entry_id)}
                        >
                            <div className="trophy">🥈</div>
                            <div className="position-num">2</div>
                            <div className="team-info">
                                <div className="team-name">{teams[1].name}</div>
                                <div className="manager-name">{teams[1].manager}</div>
                                <div className="points">{teams[1].total_points} pts</div>
                            </div>
                        </div>

                        {/* 1st Place */}
                        <div 
                            className="podium-item first clickable"
                            onClick={() => handleTeamClick(teams[0].entry_id)}
                        >
                            <div className="crown">👑</div>
                            <div className="trophy">🥇</div>
                            <div className="position-num">1</div>
                            <div className="team-info">
                                <div className="team-name">{teams[0].name}</div>
                                <div className="manager-name">{teams[0].manager}</div>
                                <div className="points">{teams[0].total_points} pts</div>
                            </div>
                        </div>

                        {/* 3rd Place */}
                        <div 
                            className="podium-item third clickable"
                            onClick={() => handleTeamClick(teams[2].entry_id)}
                        >
                            <div className="trophy">🥉</div>
                            <div className="position-num">3</div>
                            <div className="team-info">
                                <div className="team-name">{teams[2].name}</div>
                                <div className="manager-name">{teams[2].manager}</div>
                                <div className="points">{teams[2].total_points} pts</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Full Rankings Table */}
            <div className="rankings-section">
                <h2 className="section-title">
                    Full Standings
                    {totalPlayers > teams.length && (
                        <span className="showing-count"> (Showing top {teams.length})</span>
                    )}
                </h2>
                <div className="rankings-table">
                    {teams.map((team) => (
                        <div
                            key={team.entry_id}
                            className={`rank-row ${isMyTeam(team.entry_id) ? 'my-team' : ''} clickable`}
                            onClick={() => handleTeamClick(team.entry_id)}
                        >
                            <div className="rank-position">
                                <span
                                    className="rank-number"
                                    style={{ color: getRankColor(team.rank) }}
                                >
                                    {getRankIcon(team.rank)}
                                </span>
                            </div>

                            <div className="team-details">
                                <div className="team-name-row">
                                    <span className="team-name">{team.name}</span>
                                    {isMyTeam(team.entry_id) && (
                                        <span className="you-badge">You</span>
                                    )}
                                </div>
                                <span className="manager-name">{team.manager}</span>
                            </div>

                            <div className="points-column">
                                <span className="points-value">{team.total_points}</span>
                                <span className="points-label">pts</span>
                            </div>

                            <div className="arrow-icon">→</div>
                        </div>
                    ))}
                </div>

                {teams.length === 0 && (
                    <div className="empty-state">
                        <div className="empty-icon">📊</div>
                        <p>No standings data yet</p>
                    </div>
                )}
            </div>

            <style jsx>{`
                .standings-page {
                    min-height: 100vh;
                    background: linear-gradient(180deg, #0a0e27 0%, #151a32 100%);
                    padding: 1rem;
                    padding-bottom: 3rem;
                }

                .clickable {
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                /* Header */
                .page-header {
                    margin-bottom: 1.5rem;
                }

                .back-btn {
                    padding: 0.625rem 1rem;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 8px;
                    color: var(--text-primary);
                    font-size: 0.875rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    margin-bottom: 1rem;
                }

                .back-btn:hover {
                    background: rgba(255, 255, 255, 0.08);
                    border-color: var(--primary);
                    color: var(--primary);
                }

                .page-title {
                    font-size: 1.75rem;
                    font-weight: 800;
                    background: linear-gradient(135deg, #00ff87 0%, #00cc6a 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    margin: 0 0 0.75rem 0;
                }

                .league-meta {
                    display: flex;
                    gap: 1rem;
                    flex-wrap: wrap;
                    align-items: center;
                }

                .league-duration {
                    display: flex;
                    align-items: center;
                    gap: 0.375rem;
                    padding: 0.375rem 0.75rem;
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 6px;
                    font-size: 0.875rem;
                    font-weight: 600;
                    color: var(--text-primary);
                }

                .duration-icon {
                    font-size: 1rem;
                }

                /* My Rank Card */
                .my-rank-card {
                    position: relative;
                    background: linear-gradient(145deg, rgba(30, 39, 70, 0.6) 0%, rgba(21, 26, 50, 0.5) 100%);
                    backdrop-filter: blur(10px);
                    border: 2px solid rgba(0, 255, 135, 0.3);
                    border-radius: 12px;
                    padding: 1.25rem;
                    margin-bottom: 2rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    box-shadow: 0 4px 12px rgba(0, 255, 135, 0.15);
                }

                .my-rank-card:hover {
                    border-color: rgba(0, 255, 135, 0.5);
                    box-shadow: 0 6px 20px rgba(0, 255, 135, 0.25);
                    transform: translateY(-2px);
                }

                .view-team-indicator {
                    font-size: 1.5rem;
                    color: var(--primary);
                    opacity: 0;
                    transition: opacity 0.3s ease;
                }

                .my-rank-card:hover .view-team-indicator {
                    opacity: 1;
                }

                .rank-badge {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .rank-icon {
                    font-size: 2.5rem;
                }

                .rank-info {
                    display: flex;
                    flex-direction: column;
                    gap: 0.25rem;
                }

                .rank-label {
                    font-size: 0.75rem;
                    font-weight: 600;
                    color: var(--text-muted);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .rank-value {
                    font-size: 1.5rem;
                    font-weight: 800;
                    color: var(--primary);
                }

                .rank-stats {
                    display: flex;
                    gap: 1.5rem;
                }

                .stat {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-end;
                    gap: 0.25rem;
                }

                .stat-label {
                    font-size: 0.75rem;
                    color: var(--text-muted);
                }

                .stat-value {
                    font-size: 1.25rem;
                    font-weight: 700;
                    color: var(--text-primary);
                }

                /* Podium */
                .podium-section {
                    margin-bottom: 2rem;
                }

                .podium {
                    display: flex;
                    align-items: flex-end;
                    justify-content: center;
                    gap: 0.5rem;
                    padding: 2rem 1rem;
                }

                .podium-item {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    background: linear-gradient(145deg, rgba(30, 39, 70, 0.6) 0%, rgba(21, 26, 50, 0.5) 100%);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 12px;
                    padding: 1rem 0.75rem;
                    position: relative;
                    transition: all 0.3s ease;
                }

                .podium-item:hover {
                    transform: translateY(-8px) scale(1.05);
                }

                .podium-item.first {
                    flex: 1;
                    max-width: 140px;
                    border-color: rgba(255, 215, 0, 0.5);
                    box-shadow: 0 8px 24px rgba(255, 215, 0, 0.2);
                }

                .podium-item.first:hover {
                    border-color: rgba(255, 215, 0, 0.8);
                    box-shadow: 0 12px 32px rgba(255, 215, 0, 0.4);
                }

                .podium-item.second {
                    flex: 1;
                    max-width: 130px;
                    border-color: rgba(192, 192, 192, 0.5);
                    margin-top: 1.5rem;
                }

                .podium-item.second:hover {
                    border-color: rgba(192, 192, 192, 0.8);
                    box-shadow: 0 8px 24px rgba(192, 192, 192, 0.3);
                }

                .podium-item.third {
                    flex: 1;
                    max-width: 130px;
                    border-color: rgba(205, 127, 50, 0.5);
                    margin-top: 2rem;
                }

                .podium-item.third:hover {
                    border-color: rgba(205, 127, 50, 0.8);
                    box-shadow: 0 8px 24px rgba(205, 127, 50, 0.3);
                }

                .crown {
                    font-size: 1.5rem;
                    position: absolute;
                    top: -1.25rem;
                    animation: bounce 2s infinite;
                }

                @keyframes bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-5px); }
                }

                .trophy {
                    font-size: 2rem;
                    margin-bottom: 0.5rem;
                }

                .position-num {
                    font-size: 1rem;
                    font-weight: 700;
                    color: var(--text-muted);
                    margin-bottom: 0.5rem;
                }

                .team-info {
                    text-align: center;
                    width: 100%;
                }

                .podium-item .team-name {
                    font-size: 0.875rem;
                    font-weight: 700;
                    color: var(--text-primary);
                    margin-bottom: 0.25rem;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    width: 100%;
                }

                .podium-item .manager-name {
                    font-size: 0.75rem;
                    color: var(--text-muted);
                    margin-bottom: 0.5rem;
                    display: block;
                }

                .podium-item .points {
                    font-size: 0.875rem;
                    font-weight: 700;
                    color: var(--primary);
                    padding: 0.25rem 0.5rem;
                    background: rgba(0, 255, 135, 0.1);
                    border-radius: 6px;
                }

                /* Rankings Section */
                .rankings-section {
                    margin-top: 2rem;
                }

                .section-title {
                    font-size: 1.25rem;
                    font-weight: 700;
                    color: var(--text-primary);
                    margin-bottom: 1rem;
                }

                .showing-count {
                    font-size: 0.875rem;
                    font-weight: 500;
                    color: var(--text-muted);
                }

                .rankings-table {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }

                .rank-row {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    background: linear-gradient(145deg, rgba(30, 39, 70, 0.6) 0%, rgba(21, 26, 50, 0.5) 100%);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 12px;
                    padding: 1rem;
                    transition: all 0.3s ease;
                }

                .rank-row:hover {
                    transform: translateX(4px);
                    border-color: rgba(0, 255, 135, 0.3);
                    box-shadow: 0 4px 12px rgba(0, 255, 135, 0.1);
                }

                .rank-row.my-team {
                    background: linear-gradient(145deg, rgba(0, 255, 135, 0.1) 0%, rgba(0, 204, 106, 0.05) 100%);
                    border-color: rgba(0, 255, 135, 0.5);
                    box-shadow: 0 4px 12px rgba(0, 255, 135, 0.15);
                }

                .rank-position {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-width: 50px;
                }

                .rank-number {
                    font-size: 1.25rem;
                    font-weight: 800;
                }

                .team-details {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 0.25rem;
                }

                .team-name-row {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .rank-row .team-name {
                    font-size: 1rem;
                    font-weight: 700;
                    color: var(--text-primary);
                }

                .you-badge {
                    padding: 0.125rem 0.5rem;
                    background: linear-gradient(135deg, var(--primary) 0%, #00cc6a 100%);
                    border-radius: 12px;
                    font-size: 0.625rem;
                    font-weight: 700;
                    color: #0a0e27;
                    text-transform: uppercase;
                }

                .rank-row .manager-name {
                    font-size: 0.8125rem;
                    color: var(--text-muted);
                }

                .points-column {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-end;
                    gap: 0.125rem;
                }

                .points-value {
                    font-size: 1.25rem;
                    font-weight: 800;
                    color: var(--primary);
                }

                .points-label {
                    font-size: 0.75rem;
                    color: var(--text-muted);
                }

                .arrow-icon {
                    font-size: 1.25rem;
                    color: var(--text-muted);
                    opacity: 0;
                    transition: opacity 0.3s ease;
                }

                .rank-row:hover .arrow-icon {
                    opacity: 1;
                    color: var(--primary);
                }

                /* Empty State */
                .empty-state {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 3rem 2rem;
                    text-align: center;
                }

                .empty-icon {
                    font-size: 3rem;
                    margin-bottom: 1rem;
                    opacity: 0.5;
                }

                .empty-state p {
                    font-size: 0.9375rem;
                    color: var(--text-muted);
                }

                /* Responsive */
                @media (max-width: 768px) {
                    .page-title {
                        font-size: 1.5rem;
                    }

                    .my-rank-card {
                        flex-direction: column;
                        gap: 1rem;
                        align-items: flex-start;
                    }

                    .rank-stats {
                        width: 100%;
                        justify-content: space-around;
                    }

                    .view-team-indicator {
                        position: absolute;
                        right: 1rem;
                        top: 50%;
                        transform: translateY(-50%);
                    }

                    .podium {
                        padding: 1rem 0.5rem;
                    }

                    .podium-item {
                        padding: 0.75rem 0.5rem;
                    }

                    .trophy {
                        font-size: 1.5rem;
                    }

                    .rank-number {
                        font-size: 1rem;
                    }
                }
            `}</style>
        </div>
    );
}