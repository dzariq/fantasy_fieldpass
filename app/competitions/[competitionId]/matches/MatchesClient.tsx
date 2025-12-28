'use client';

import { useState, useMemo,useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface Match {
    id: number;
    home_club_id: number;
    away_club_id: number;
    home_club_name: string;
    away_club_name: string;
    home_club_logo: string;
    away_club_logo: string;
    home_score: number | null;
    away_score: number | null;
    date: number;
    matchweek: number;
    status: string;
}

interface MatchesClientProps {
    initialMatches: Match[];
    competitionName: string;
    currentMatchweek: number;
    totalMatchweeks: number;
    competitionId: string;
}

export default function MatchesClient({
    initialMatches,
    competitionName,
    currentMatchweek,
    totalMatchweeks,
    competitionId,
}: MatchesClientProps) {
    const router = useRouter();
    const [selectedMatchweek, setSelectedMatchweek] = useState(currentMatchweek);


    // Filter matches by selected matchweek
    const filteredMatches = useMemo(() => {
        return initialMatches.filter(match => match.matchweek === selectedMatchweek);
    }, [initialMatches, selectedMatchweek]);

    // Format date
    const formatDate = (timestamp: number) => {
        const date = new Date(timestamp * 1000);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    // Get status badge color
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'live':
                return 'status-live';
            case 'finished':
                return 'status-finished';
            default:
                return 'status-scheduled';
        }
    };

    return (
        <div className="matches-page">
            {/* Header */}
            <header className="page-header">
                <div className="header-content">
                    <button className="back-btn" onClick={() => router.back()}>
                        <span className="icon">←</span>
                        <span className="text">Back</span>
                    </button>
                    <div className="header-title">
                        <h1>{competitionName}</h1>
                        <p>Fixtures & Results</p>
                    </div>
                </div>
            </header>

            {/* Matchweek Filter */}
            <div className="matchweek-filter">
                <button
                    className="mw-btn"
                    onClick={() => setSelectedMatchweek(Math.max(1, selectedMatchweek - 1))}
                    disabled={selectedMatchweek === 1}
                >
                    ←
                </button>

                <div className="mw-selector">
                    <span className="mw-label">Matchweek</span>
                    <div className="mw-number">{selectedMatchweek}</div>
                    <span className="mw-total">of {totalMatchweeks}</span>
                    {selectedMatchweek === currentMatchweek && (
                        <span className="mw-badge current">Current</span>
                    )}
                    {selectedMatchweek < currentMatchweek && (
                        <span className="mw-badge past">Past</span>
                    )}
                    {selectedMatchweek > currentMatchweek && (
                        <span className="mw-badge future">Upcoming</span>
                    )}
                </div>

                <button
                    className="mw-btn"
                    onClick={() => setSelectedMatchweek(Math.min(totalMatchweeks, selectedMatchweek + 1))}
                    disabled={selectedMatchweek >= totalMatchweeks}
                >
                    →
                </button>
            </div>

            {/* Matches List */}
            <div className="matches-container">
                {filteredMatches.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">📅</div>
                        <h3>No matches scheduled</h3>
                        <p>There are no matches for Matchweek {selectedMatchweek}</p>
                    </div>
                ) : (
                    <div className="matches-grid">
                        {filteredMatches.map((match) => (
                            <div key={match.id} className="match-card">
                                {/* Status Badge */}
                                <div className={`status-badge ${getStatusColor(match.status)}`}>
                                    {match.status === 'ONGOING' && '● LIVE'}
                                    {match.status === 'END' && 'FT'}
                                    {match.status === 'NOT_STARTED' && formatDate(match.date)}
                                </div>

                                {/* Match Info */}
                                <div className="match-content">
                                    {/* Home Team */}
                                    <div className="team home-team">
                                        <div className="team-logo">
                                            {match.home_club_logo ? (
                                                <Image
                                                    src={`${match.home_club_logo}`}
                                                    alt={match.home_club_name}
                                                    width={60}
                                                    height={60}
                                                    className="logo-img"
                                                />
                                            ) : (
                                                <div className="logo-placeholder">🛡️</div>
                                            )}
                                        </div>
                                        <span className="team-name">{match.home_club_name}</span>
                                    </div>

                                    {/* Score / Time */}
                                    <div className="match-score">
                                        {match.status === 'END' || match.status === 'ONGOING' ? (
                                            <>
                                                <div className="score">
                                                    <span className="home-score">{match.home_score ?? 0}</span>
                                                    <span className="separator">-</span>
                                                    <span className="away-score">{match.away_score ?? 0}</span>
                                                </div>
                                                {match.status === 'ONGOING' && (
                                                    <div className="live-indicator">
                                                        <span className="pulse"></span>
                                                        LIVE
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <div className="match-time">
                                                <div className="date">
                                                    {new Date(match.date * 1000).toLocaleDateString('en-US', {
                                                        weekday: 'short',
                                                        month: 'short',
                                                        day: 'numeric'
                                                    })}
                                                </div>
                                                <div className="time">
                                                    {new Date(match.date * 1000).toLocaleTimeString('en-US', {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Away Team */}
                                    <div className="team away-team">
                                        <div className="team-logo">
                                            {match.away_club_logo ? (
                                                <Image
                                                    src={`${match.away_club_logo}`}
                                                    alt={match.away_club_name}
                                                    width={60}
                                                    height={60}
                                                    className="logo-img"
                                                />
                                            ) : (
                                                <div className="logo-placeholder">🛡️</div>
                                            )}
                                        </div>
                                        <span className="team-name">{match.away_club_name}</span>
                                    </div>
                                </div>

                            </div>
                        ))}
                    </div>
                )}
            </div>

            <style jsx>{`
                .matches-page {
                    min-height: 100vh;
                    background: linear-gradient(180deg, #0a0e27 0%, #151a32 100%);
                    color: white;
                }

                /* Header */
                .page-header {
                    background: linear-gradient(145deg, #1e2746 0%, #151a32 100%);
                    border-bottom: 2px solid rgba(0, 255, 135, 0.1);
                    padding: 1.5rem 2rem;
                    position: sticky;
                    top: 0;
                    z-index: 100;
                    backdrop-filter: blur(20px);
                }

                .header-content {
                    max-width: 1400px;
                    margin: 0 auto;
                    display: flex;
                    align-items: center;
                    gap: 2rem;
                }

                .back-btn {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.75rem 1.25rem;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                    color: white;
                    font-size: 0.9rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.25s ease;
                }

                .back-btn:hover {
                    background: rgba(0, 255, 135, 0.1);
                    border-color: rgba(0, 255, 135, 0.3);
                    transform: translateX(-4px);
                }

                .back-btn .icon {
                    font-size: 1.25rem;
                }

                .header-title h1 {
                    font-size: 1.75rem;
                    font-weight: 800;
                    margin: 0;
                    background: linear-gradient(135deg, #00ff87 0%, #00cc6a 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .header-title p {
                    font-size: 0.875rem;
                    color: rgba(255, 255, 255, 0.6);
                    margin: 0.25rem 0 0 0;
                }

                /* Matchweek Filter */
                .matchweek-filter {
                    max-width: 1400px;
                    margin: 2rem auto;
                    padding: 0 2rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 2rem;
                }

                .mw-btn {
                    width: 56px;
                    height: 56px;
                    border-radius: 12px;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    color: white;
                    font-size: 1.5rem;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.25s ease;
                }

                .mw-btn:hover:not(:disabled) {
                    background: rgba(0, 255, 135, 0.15);
                    border-color: rgba(0, 255, 135, 0.4);
                    transform: scale(1.05);
                }

                .mw-btn:disabled {
                    opacity: 0.3;
                    cursor: not-allowed;
                }

                .mw-selector {
                    background: linear-gradient(145deg, rgba(30, 39, 70, 0.8) 0%, rgba(21, 26, 50, 0.6) 100%);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 16px;
                    padding: 1.5rem 3rem;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 0.5rem;
                    min-width: 250px;
                }

                .mw-label {
                    font-size: 0.75rem;
                    font-weight: 600;
                    color: rgba(255, 255, 255, 0.6);
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }

                .mw-number {
                    font-size: 3rem;
                    font-weight: 800;
                    background: linear-gradient(135deg, #00ff87 0%, #00cc6a 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    line-height: 1;
                }

                .mw-total {
                    font-size: 1rem;
                    font-weight: 600;
                    color: rgba(255, 255, 255, 0.5);
                }

                .mw-badge {
                    padding: 0.375rem 1rem;
                    border-radius: 20px;
                    font-size: 0.7rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    margin-top: 0.5rem;
                }

                .mw-badge.current {
                    background: linear-gradient(135deg, rgba(0, 255, 135, 0.2) 0%, rgba(0, 204, 106, 0.2) 100%);
                    color: #00ff87;
                }

                .mw-badge.past {
                    background: rgba(156, 163, 175, 0.2);
                    color: #9ca3af;
                }

                .mw-badge.future {
                    background: rgba(0, 184, 255, 0.2);
                    color: #00b8ff;
                }

                /* Matches Container */
                .matches-container {
                    max-width: 1400px;
                    margin: 0 auto;
                    padding: 0 2rem 3rem;
                }

                .matches-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
                    gap: 1.5rem;
                }

                /* Match Card */
                .match-card {
                    background: linear-gradient(145deg, rgba(30, 39, 70, 0.6) 0%, rgba(21, 26, 50, 0.4) 100%);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 16px;
                    padding: 1.5rem;
                    transition: all 0.3s ease;
                    position: relative;
                    overflow: hidden;
                }

                .match-card:hover {
                    transform: translateY(-4px);
                    border-color: rgba(0, 255, 135, 0.3);
                    box-shadow: 0 8px 32px rgba(0, 255, 135, 0.15);
                }

                .status-badge {
                    position: absolute;
                    top: 1rem;
                    right: 1rem;
                    padding: 0.5rem 1rem;
                    border-radius: 20px;
                    font-size: 0.7rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .status-live {
                    background: linear-gradient(135deg, #ff2882 0%, #ff1468 100%);
                    color: white;
                    animation: pulse-live 2s ease-in-out infinite;
                }

                .status-finished {
                    background: rgba(156, 163, 175, 0.2);
                    color: #9ca3af;
                }

                .status-scheduled {
                    background: rgba(0, 184, 255, 0.2);
                    color: #00b8ff;
                    font-size: 0.65rem;
                }

                @keyframes pulse-live {
                    0%, 100% {
                        box-shadow: 0 0 0 0 rgba(255, 40, 130, 0.7);
                    }
                    50% {
                        box-shadow: 0 0 0 10px rgba(255, 40, 130, 0);
                    }
                }

                .match-content {
                    display: grid;
                    grid-template-columns: 1fr auto 1fr;
                    align-items: center;
                    gap: 1.5rem;
                    margin-top: 0.5rem;
                }

                .team {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 0.75rem;
                }

                .team-logo {
                    width: 70px;
                    height: 70px;
                    border-radius: 12px;
                    background: rgba(255, 255, 255, 0.05);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    overflow: hidden;
                    border: 2px solid rgba(255, 255, 255, 0.1);
                }

                .logo-img {
                    width: 100%;
                    height: 100%;
                    object-fit: contain;
                }

                .logo-placeholder {
                    font-size: 2rem;
                    opacity: 0.5;
                }

                .team-name {
                    font-size: 0.9rem;
                    font-weight: 700;
                    text-align: center;
                    color: rgba(255, 255, 255, 0.9);
                }

                .match-score {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 0.5rem;
                }

                .score {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    font-size: 2.5rem;
                    font-weight: 800;
                }

                .home-score,
                .away-score {
                    min-width: 60px;
                    text-align: center;
                    background: linear-gradient(135deg, #00ff87 0%, #00cc6a 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .separator {
                    color: rgba(255, 255, 255, 0.3);
                    font-size: 2rem;
                }

                .live-indicator {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 0.75rem;
                    font-weight: 700;
                    color: #ff2882;
                }

                .pulse {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background: #ff2882;
                    animation: pulse 1.5s ease-in-out infinite;
                }

                @keyframes pulse {
                    0%, 100% {
                        opacity: 1;
                        transform: scale(1);
                    }
                    50% {
                        opacity: 0.5;
                        transform: scale(1.2);
                    }
                }

                .match-time {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 0.25rem;
                }

                .time {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: rgba(255, 255, 255, 0.9);
                }

                .venue {
                    font-size: 0.7rem;
                    color: rgba(255, 255, 255, 0.5);
                    text-align: center;
                }

                .match-footer {
                    margin-top: 1.25rem;
                    padding-top: 1rem;
                    border-top: 1px solid rgba(255, 255, 255, 0.1);
                    display: flex;
                    justify-content: center;
                }

                .venue-info {
                    font-size: 0.8rem;
                    color: rgba(255, 255, 255, 0.6);
                    display: flex;
                    align-items: center;
                    gap: 0.375rem;
                }

                /* Empty State */
                .empty-state {
                    text-align: center;
                    padding: 4rem 2rem;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 1rem;
                }

                .empty-icon {
                    font-size: 4rem;
                    opacity: 0.3;
                }

                .empty-state h3 {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: rgba(255, 255, 255, 0.9);
                    margin: 0;
                }

                .empty-state p {
                    font-size: 1rem;
                    color: rgba(255, 255, 255, 0.6);
                    margin: 0;
                }

                /* Responsive */
                @media (max-width: 768px) {
                    .page-header {
                        padding: 1.25rem 1.5rem;
                    }

                    .header-content {
                        gap: 1.25rem;
                    }

                    .header-title h1 {
                        font-size: 1.5rem;
                    }

                    .matchweek-filter {
                        padding: 0 1.5rem;
                        gap: 1.25rem;
                    }

                    .mw-btn {
                        width: 48px;
                        height: 48px;
                    }

                    .mw-selector {
                        padding: 1.25rem 2rem;
                        min-width: 200px;
                    }

                    .mw-number {
                        font-size: 2.5rem;
                    }

                    .matches-container {
                        padding: 0 1.5rem 2rem;
                    }

                    .matches-grid {
                        grid-template-columns: 1fr;
                        gap: 1.25rem;
                    }

                    .match-content {
                        gap: 1rem;
                    }

                    .team-logo {
                        width: 60px;
                        height: 60px;
                    }

                    .score {
                        font-size: 2rem;
                        gap: 0.75rem;
                    }

                    .home-score,
                    .away-score {
                        min-width: 50px;
                    }
                }

                @media (max-width: 480px) {
                    .back-btn .text {
                        display: none;
                    }

                    .team-name {
                        font-size: 0.8rem;
                    }

                    .status-scheduled {
                        font-size: 0.6rem;
                        padding: 0.4rem 0.75rem;
                    }
                }
            `}</style>
        </div>
    );
}