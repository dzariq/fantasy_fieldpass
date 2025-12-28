'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import PlayerCard from '@/components/PlayerCard';

interface Player {
    id: number;
    name: string;
    value: number;
    position: string;
    team_name: string;
    team_jersey: string;
    points: number;
    minutes_played: number;
    iscaptain: number;
    isvicecaptain?: number;
}

interface Picks {
    formation: string;
    gk: Player[];
    df: Player[];
    mf: Player[];
    st: Player[];
    subgk: Player[];
    sub: Player[];
}

interface TeamData {
    matchweek: number;
    is_new: boolean;
    picks: Picks;
    points: number;
    record: {
        transfers: any[];
        triple: boolean;
        benchboost: boolean;
        wildcard: boolean;
    };
}

interface UserData {
    _id: string;
    phone: string;
    entry_id: string;
    manager: string;
    name: string;
    team_data: TeamData[];
    total_points: number;
}

interface UserInfoClientProps {
    competitionId: string;
    teamId: string;
}

export default function UserInfoClient({
    teamId,
    competitionId
}: UserInfoClientProps) {
    const router = useRouter();
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedMatchweek, setSelectedMatchweek] = useState(0);
    const [showStats, setShowStats] = useState(false);

    // Handle Safari bfcache issue
    useEffect(() => {
        const handlePageShow = (event: PageTransitionEvent) => {
            if (event.persisted || (performance && performance.navigation.type === 2)) {
                console.log('🔄 Page restored from bfcache - reloading');
                window.location.reload();
            }
        };

        const handleVisibilityChange = () => {
            if (!document.hidden) {
                console.log('📱 Page became visible');
                const authData = localStorage.getItem('fantasy_auth');
                if (!authData) {
                    router.push('/');
                }
            }
        };

        window.addEventListener('pageshow', handlePageShow);
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            window.removeEventListener('pageshow', handlePageShow);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [router]);

    useEffect(() => {
        async function fetchTeam() {
            const authData = localStorage.getItem('fantasy_auth');
            if (!authData) {
                router.push('/');
                return;
            }

            try {
                const response = await fetch(
                    `/api/user/${competitionId}/${teamId}`,
                    {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    }
                );
                
                if (response.ok) {
                    const data = await response.json();
                    const user = Array.isArray(data) ? data[0] : data;
                    setUserData(user);
                    if (user?.team_data?.length > 0) {
                        setSelectedMatchweek(user.team_data.length - 1);
                    }
                    // Trigger stats animation
                    setTimeout(() => setShowStats(true), 300);
                }
            } catch (error) {
                console.error('Error fetching team:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchTeam();
    }, [teamId, competitionId, router]);

    const currentTeamData = userData?.team_data?.[selectedMatchweek];

    const renderPlayer = (player: Player, isSubstitute: boolean = false) => (
        <PlayerCard
            key={player.id}
            player={player}
            teamName={player.team_name}
            showPrice={false}
            allPlayers={currentTeamData?.picks}
        />
    );

    if (loading) {
        return (
            <div className="team-page">
                <div className="loading-state">
                    <div className="loading-spinner">
                        <div className="spinner-ring"></div>
                        <div className="spinner-ring"></div>
                        <div className="spinner-ring"></div>
                        <div className="football-icon">⚽</div>
                    </div>
                    <p className="loading-text">Loading your team...</p>
                </div>
                <style jsx>{`
                    .team-page {
                        min-height: 100vh;
                        background: linear-gradient(180deg, #0a0e27 0%, #151a32 50%, #0f1629 100%);
                        padding: 1rem;
                        position: relative;
                        overflow: hidden;
                    }
                    .team-page::before {
                        content: '';
                        position: absolute;
                        top: -50%;
                        left: -50%;
                        width: 200%;
                        height: 200%;
                        background: radial-gradient(circle, rgba(0, 255, 135, 0.03) 1px, transparent 1px);
                        background-size: 50px 50px;
                        animation: gridMove 20s linear infinite;
                    }
                    @keyframes gridMove {
                        0% { transform: translate(0, 0); }
                        100% { transform: translate(50px, 50px); }
                    }
                    .loading-state {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        min-height: 80vh;
                        gap: 2rem;
                        position: relative;
                        z-index: 1;
                    }
                    .loading-spinner {
                        position: relative;
                        width: 120px;
                        height: 120px;
                    }
                    .spinner-ring {
                        position: absolute;
                        width: 100%;
                        height: 100%;
                        border: 3px solid transparent;
                        border-radius: 50%;
                        animation: spin 2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
                    }
                    .spinner-ring:nth-child(1) {
                        border-top-color: var(--primary);
                        animation-delay: -0.45s;
                    }
                    .spinner-ring:nth-child(2) {
                        border-top-color: #00cc6a;
                        animation-delay: -0.3s;
                    }
                    .spinner-ring:nth-child(3) {
                        border-top-color: rgba(0, 255, 135, 0.3);
                        animation-delay: -0.15s;
                    }
                    .football-icon {
                        position: absolute;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        font-size: 2.5rem;
                        animation: bounce 1s ease-in-out infinite;
                    }
                    @keyframes spin {
                        to { transform: rotate(360deg); }
                    }
                    @keyframes bounce {
                        0%, 100% { transform: translate(-50%, -50%) scale(1); }
                        50% { transform: translate(-50%, -60%) scale(1.1); }
                    }
                    .loading-text {
                        color: var(--text-muted);
                        font-size: 1.125rem;
                        font-weight: 500;
                        animation: pulse 2s ease-in-out infinite;
                    }
                    @keyframes pulse {
                        0%, 100% { opacity: 0.6; }
                        50% { opacity: 1; }
                    }
                `}</style>
            </div>
        );
    }

    if (!userData || !currentTeamData) {
        return (
            <div className="team-page">
                <div className="empty-state">
                    <div className="empty-icon">
                        <div className="icon-circle">⚽</div>
                    </div>
                    <h3>Team not found</h3>
                    <p>We couldn't find the team you're looking for</p>
                    <button onClick={() => router.back()} className="back-btn-alt">
                        <span className="btn-icon">←</span>
                        Go Back
                    </button>
                </div>
                <style jsx>{`
                    .team-page {
                        min-height: 100vh;
                        background: linear-gradient(180deg, #0a0e27 0%, #151a32 50%, #0f1629 100%);
                        padding: 1rem;
                    }
                    .empty-state {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        min-height: 70vh;
                        gap: 1.5rem;
                    }
                    .empty-icon {
                        position: relative;
                    }
                    .icon-circle {
                        width: 120px;
                        height: 120px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 4rem;
                        background: linear-gradient(145deg, rgba(30, 39, 70, 0.6), rgba(21, 26, 50, 0.5));
                        border: 2px solid rgba(0, 255, 135, 0.2);
                        border-radius: 50%;
                        animation: iconFloat 3s ease-in-out infinite;
                    }
                    @keyframes iconFloat {
                        0%, 100% { transform: translateY(0); }
                        50% { transform: translateY(-10px); }
                    }
                    .empty-state h3 {
                        color: var(--text-primary);
                        margin: 0;
                        font-size: 1.5rem;
                        font-weight: 700;
                    }
                    .empty-state p {
                        color: var(--text-muted);
                        margin: 0;
                    }
                    .back-btn-alt {
                        padding: 0.875rem 2rem;
                        background: linear-gradient(135deg, var(--primary) 0%, #00cc6a 100%);
                        border: none;
                        border-radius: 12px;
                        color: #0a0e27;
                        font-weight: 700;
                        font-size: 1rem;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        gap: 0.5rem;
                        transition: all 0.3s ease;
                        box-shadow: 0 4px 16px rgba(0, 255, 135, 0.3);
                    }
                    .back-btn-alt:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 6px 24px rgba(0, 255, 135, 0.4);
                    }
                    .btn-icon {
                        font-size: 1.25rem;
                        transition: transform 0.3s ease;
                    }
                    .back-btn-alt:hover .btn-icon {
                        transform: translateX(-4px);
                    }
                `}</style>
            </div>
        );
    }

    return (
        <div className="team-page">
            {/* Animated Background */}
            <div className="animated-bg">
                <div className="bg-orb orb-1"></div>
                <div className="bg-orb orb-2"></div>
                <div className="bg-orb orb-3"></div>
            </div>

            {/* Header */}
            <header className="page-header">
                <button className="back-btn" onClick={() => router.back()}>
                    <span className="btn-arrow">←</span>
                    <span>Back</span>
                </button>
                
                <div className="team-banner">
                    <div className="banner-decoration">
                        <div className="trophy-icon">🏆</div>
                    </div>
                    <div className="team-info">
                        <h1 className="team-name">{userData.name}</h1>
                        <p className="manager-name">
                            <span className="manager-icon">👤</span>
                            {userData.manager}
                        </p>
                    </div>
                    <div className="total-points">
                        <div className="points-decoration">
                            <div className="star-icon">⭐</div>
                        </div>
                        <span className="points-label">Total Points</span>
                        <span className="points-value">{userData.total_points.toLocaleString()}</span>
                        <div className="points-shine"></div>
                    </div>
                </div>
            </header>

            {/* Matchweek Selector */}
            <div className="matchweek-selector">
                <div className="selector-header">
                    <h3>
                        <span className="calendar-icon">📅</span>
                        Select Matchweek
                    </h3>
                </div>
                <div className="matchweek-buttons">
                    {userData.team_data.map((data, index) => (
                        <button
                            key={data.matchweek}
                            className={`mw-btn ${selectedMatchweek === index ? 'active' : ''}`}
                            onClick={() => {
                                setSelectedMatchweek(index);
                                setShowStats(false);
                                setTimeout(() => setShowStats(true), 100);
                            }}
                        >
                            <div className="mw-btn-glow"></div>
                            <span className="mw-number">MW {data.matchweek}</span>
                            <span className="mw-points">{data.points} pts</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Stats Cards */}
            <div className={`stats-cards ${showStats ? 'show' : ''}`}>
                <div className="stat-card" style={{ animationDelay: '0.1s' }}>
                    <div className="stat-icon-wrapper">
                        <div className="stat-icon">📊</div>
                        <div className="icon-pulse"></div>
                    </div>
                    <div className="stat-info">
                        <span className="stat-label">MW Points</span>
                        <span className="stat-value">{currentTeamData.points}</span>
                    </div>
                </div>
                <div className="stat-card" style={{ animationDelay: '0.2s' }}>
                    <div className="stat-icon-wrapper">
                        <div className="stat-icon">🔄</div>
                        <div className="icon-pulse"></div>
                    </div>
                    <div className="stat-info">
                        <span className="stat-label">Transfers</span>
                        <span className="stat-value">{currentTeamData.record.transfers.length}</span>
                    </div>
                </div>
                <div className="stat-card" style={{ animationDelay: '0.3s' }}>
                    <div className="stat-icon-wrapper">
                        <div className="stat-icon">⚡</div>
                        <div className="icon-pulse"></div>
                    </div>
                    <div className="stat-info">
                        <span className="stat-label">Chips Used</span>
                        <span className="stat-value chips-value">
                            {currentTeamData.record.triple && <span className="chip-badge">3️⃣</span>}
                            {currentTeamData.record.benchboost && <span className="chip-badge">📈</span>}
                            {currentTeamData.record.wildcard && <span className="chip-badge">🃏</span>}
                            {!currentTeamData.record.triple && !currentTeamData.record.benchboost && !currentTeamData.record.wildcard && 'None'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Football Pitch */}
            <div className="pitch-container">
                <div className="pitch">
                    {/* Pitch Pattern */}
                    <div className="pitch-pattern">
                        <div className="pattern-stripe"></div>
                        <div className="pattern-stripe"></div>
                        <div className="pattern-stripe"></div>
                        <div className="pattern-stripe"></div>
                        <div className="pattern-stripe"></div>
                    </div>

                    <div className="pitch-lines">
                        <div className="center-circle"></div>
                        <div className="center-dot"></div>
                        <div className="center-line"></div>
                        <div className="penalty-area penalty-area-top">
                            <div className="goal-area goal-area-top"></div>
                        </div>
                        <div className="penalty-area penalty-area-bottom">
                            <div className="goal-area goal-area-bottom"></div>
                        </div>
                    </div>

                    {/* Formation Display */}
                    <div className="formation-badge">
                        <span className="formation-icon">⚡</span>
                        {currentTeamData.picks.formation.split('').join('-')}
                    </div>

                    {/* Players on Pitch */}
                    <div className="pitch-players">
                        <div className="line gk-line">
                            {currentTeamData.picks.gk.map(player => renderPlayer(player))}
                        </div>
                        <div className="line df-line">
                            {currentTeamData.picks.df.map(player => renderPlayer(player))}
                        </div>
                        <div className="line mf-line">
                            {currentTeamData.picks.mf.map(player => renderPlayer(player))}
                        </div>
                        <div className="line st-line">
                            {currentTeamData.picks.st.map(player => renderPlayer(player))}
                        </div>
                    </div>
                </div>

                {/* Bench */}
                <div className="bench">
                    <div className="bench-header">
                        <h3 className="bench-title">
                            <span className="bench-icon">🪑</span>
                            Substitutes
                        </h3>
                        <div className="bench-count">
                            {currentTeamData.picks.subgk.length + currentTeamData.picks.sub.length} players
                        </div>
                    </div>
                    <div className="bench-players">
                        {currentTeamData.picks.subgk.map(player => renderPlayer(player, true))}
                        {currentTeamData.picks.sub.map(player => renderPlayer(player, true))}
                    </div>
                </div>
            </div>

            <style jsx>{`
                .team-page {
                    min-height: 100vh;
                    background: linear-gradient(180deg, #0a0e27 0%, #151a32 50%, #0f1629 100%);
                    padding: 1rem;
                    padding-bottom: 3rem;
                    position: relative;
                    overflow: hidden;
                }

                .animated-bg {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    pointer-events: none;
                    z-index: 0;
                }

                .bg-orb {
                    position: absolute;
                    border-radius: 50%;
                    filter: blur(80px);
                    opacity: 0.15;
                    animation: float 20s ease-in-out infinite;
                }

                .orb-1 {
                    width: 400px;
                    height: 400px;
                    background: var(--primary);
                    top: -100px;
                    right: -100px;
                    animation-delay: 0s;
                }

                .orb-2 {
                    width: 300px;
                    height: 300px;
                    background: #00cc6a;
                    bottom: -50px;
                    left: -50px;
                    animation-delay: -7s;
                }

                .orb-3 {
                    width: 250px;
                    height: 250px;
                    background: var(--primary);
                    top: 50%;
                    left: 50%;
                    animation-delay: -14s;
                }

                @keyframes float {
                    0%, 100% { transform: translate(0, 0) rotate(0deg); }
                    33% { transform: translate(30px, -30px) rotate(120deg); }
                    66% { transform: translate(-20px, 20px) rotate(240deg); }
                }

                .page-header {
                    margin-bottom: 2rem;
                    position: relative;
                    z-index: 1;
                }

                .back-btn {
                    padding: 0.75rem 1.25rem;
                    background: rgba(255, 255, 255, 0.05);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 12px;
                    color: var(--text-primary);
                    font-size: 0.9375rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    margin-bottom: 1.5rem;
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .back-btn:hover {
                    background: rgba(255, 255, 255, 0.1);
                    border-color: var(--primary);
                    color: var(--primary);
                    transform: translateX(-4px);
                }

                .btn-arrow {
                    font-size: 1.25rem;
                    transition: transform 0.3s ease;
                }

                .back-btn:hover .btn-arrow {
                    transform: translateX(-4px);
                }

                .team-banner {
                    position: relative;
                    background: linear-gradient(145deg, rgba(30, 39, 70, 0.8) 0%, rgba(21, 26, 50, 0.6) 100%);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(0, 255, 135, 0.2);
                    border-radius: 20px;
                    padding: 2rem;
                    overflow: hidden;
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
                }

                .banner-decoration {
                    position: absolute;
                    top: -20px;
                    right: -20px;
                    width: 120px;
                    height: 120px;
                    background: linear-gradient(135deg, var(--primary), #00cc6a);
                    border-radius: 50%;
                    opacity: 0.1;
                    animation: rotate 20s linear infinite;
                }

                .trophy-icon {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    font-size: 3rem;
                    opacity: 0.3;
                }

                @keyframes rotate {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }

                .team-info {
                    margin-bottom: 1.5rem;
                }

                .team-name {
                    font-size: 2.25rem;
                    font-weight: 900;
                    background: linear-gradient(135deg, #00ff87 0%, #00cc6a 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    margin: 0 0 0.75rem 0;
                    letter-spacing: -0.5px;
                    animation: fadeInUp 0.6s ease-out;
                }

                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .manager-name {
                    font-size: 1rem;
                    color: var(--text-muted);
                    margin: 0;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    animation: fadeInUp 0.6s ease-out 0.1s backwards;
                }

                .manager-icon {
                    font-size: 1.125rem;
                }

                .total-points {
                    position: relative;
                    display: inline-flex;
                    flex-direction: column;
                    align-items: center;
                    padding: 1.5rem 2.5rem;
                    background: linear-gradient(145deg, rgba(0, 255, 135, 0.15) 0%, rgba(0, 204, 106, 0.1) 100%);
                    border: 2px solid rgba(0, 255, 135, 0.3);
                    border-radius: 16px;
                    overflow: hidden;
                    animation: fadeInUp 0.6s ease-out 0.2s backwards;
                }

                .points-decoration {
                    position: absolute;
                    top: -10px;
                    right: -10px;
                }

                .star-icon {
                    font-size: 2rem;
                    animation: sparkle 2s ease-in-out infinite;
                }

                @keyframes sparkle {
                    0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.6; }
                    50% { transform: scale(1.2) rotate(180deg); opacity: 1; }
                }

                .points-label {
                    font-size: 0.8125rem;
                    color: var(--text-muted);
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    font-weight: 600;
                    margin-bottom: 0.5rem;
                }

                .points-value {
                    font-size: 2.5rem;
                    font-weight: 900;
                    background: linear-gradient(135deg, var(--primary) 0%, #00cc6a 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    letter-spacing: -1px;
                }

                .points-shine {
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
                    animation: shine 3s ease-in-out infinite;
                }

                @keyframes shine {
                    0% { left: -100%; }
                    50%, 100% { left: 100%; }
                }

                .matchweek-selector {
                    margin-bottom: 2rem;
                    position: relative;
                    z-index: 1;
                }

                .selector-header {
                    margin-bottom: 1.25rem;
                }

                .selector-header h3 {
                    font-size: 1.25rem;
                    font-weight: 700;
                    color: var(--text-primary);
                    margin: 0;
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }

                .calendar-icon {
                    font-size: 1.5rem;
                }

                .matchweek-buttons {
                    display: flex;
                    gap: 0.75rem;
                    overflow-x: auto;
                    padding-bottom: 1rem;
                    scrollbar-width: thin;
                    scrollbar-color: rgba(0, 255, 135, 0.3) rgba(255, 255, 255, 0.1);
                }

                .matchweek-buttons::-webkit-scrollbar {
                    height: 6px;
                }

                .matchweek-buttons::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 3px;
                }

                .matchweek-buttons::-webkit-scrollbar-thumb {
                    background: rgba(0, 255, 135, 0.3);
                    border-radius: 3px;
                }

                .mw-btn {
                    position: relative;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 0.375rem;
                    padding: 1rem 1.5rem;
                    background: rgba(255, 255, 255, 0.05);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 12px;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    white-space: nowrap;
                    overflow: hidden;
                }

                .mw-btn-glow {
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(135deg, var(--primary), #00cc6a);
                    opacity: 0;
                    transition: opacity 0.3s ease;
                    border-radius: 12px;
                }

                .mw-btn:hover {
                    background: rgba(255, 255, 255, 0.08);
                    border-color: rgba(0, 255, 135, 0.4);
                    transform: translateY(-2px);
                    box-shadow: 0 4px 16px rgba(0, 255, 135, 0.2);
                }

                .mw-btn.active {
                    background: linear-gradient(135deg, var(--primary) 0%, #00cc6a 100%);
                    border-color: var(--primary);
                    transform: translateY(-2px);
                    box-shadow: 0 8px 24px rgba(0, 255, 135, 0.4);
                }

                .mw-btn.active .mw-btn-glow {
                    opacity: 0.2;
                    animation: pulse-glow 2s ease-in-out infinite;
                }

                @keyframes pulse-glow {
                    0%, 100% { opacity: 0.2; }
                    50% { opacity: 0.4; }
                }

                .mw-number {
                    position: relative;
                    z-index: 1;
                    font-size: 0.9375rem;
                    font-weight: 700;
                    color: var(--text-primary);
                }

                .mw-btn.active .mw-number {
                    color: #0a0e27;
                }

                .mw-points {
                    position: relative;
                    z-index: 1;
                    font-size: 0.8125rem;
                    color: var(--text-muted);
                    font-weight: 600;
                }

                .mw-btn.active .mw-points {
                    color: rgba(10, 14, 39, 0.8);
                }

                .stats-cards {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
                    gap: 1rem;
                    margin-bottom: 2rem;
                    position: relative;
                    z-index: 1;
                }

                .stat-card {
                    display: flex;
                    align-items: center;
                    gap: 1.25rem;
                    padding: 1.5rem;
                    background: linear-gradient(145deg, rgba(30, 39, 70, 0.8) 0%, rgba(21, 26, 50, 0.6) 100%);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 16px;
                    transition: all 0.3s ease;
                    opacity: 0;
                    transform: translateY(20px);
                }

                .stats-cards.show .stat-card {
                    animation: slideInUp 0.6s ease-out forwards;
                }

                @keyframes slideInUp {
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .stat-card:hover {
                    border-color: rgba(0, 255, 135, 0.3);
                    transform: translateY(-4px);
                    box-shadow: 0 8px 24px rgba(0, 255, 135, 0.2);
                }

                .stat-icon-wrapper {
                    position: relative;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .stat-icon {
                    font-size: 2.5rem;
                    position: relative;
                    z-index: 1;
                }

                .icon-pulse {
                    position: absolute;
                    inset: -10px;
                    background: linear-gradient(135deg, var(--primary), #00cc6a);
                    opacity: 0.2;
                    border-radius: 50%;
                    animation: pulse 2s ease-in-out infinite;
                }

                @keyframes pulse {
                    0%, 100% { transform: scale(1); opacity: 0.2; }
                    50% { transform: scale(1.2); opacity: 0.3; }
                }

                .stat-info {
                    display: flex;
                    flex-direction: column;
                    gap: 0.375rem;
                    flex: 1;
                }

                .stat-label {
                    font-size: 0.8125rem;
                    color: var(--text-muted);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    font-weight: 600;
                }

                .stat-value {
                    font-size: 1.5rem;
                    font-weight: 800;
                    color: var(--text-primary);
                }

                .chips-value {
                    display: flex;
                    gap: 0.5rem;
                    font-size: 1.25rem;
                }

                .chip-badge {
                    display: inline-block;
                    animation: bounceIn 0.6s ease-out;
                }

                @keyframes bounceIn {
                    0% { transform: scale(0); }
                    50% { transform: scale(1.2); }
                    100% { transform: scale(1); }
                }

                .pitch-container {
                    margin-bottom: 2rem;
                    position: relative;
                    z-index: 1;
                }

                .pitch {
                    position: relative;
                    background: linear-gradient(180deg, #1a5f3a 0%, #135231 50%, #0f4229 100%);
                    border-radius: 20px;
                    padding: 2.5rem 1rem;
                    margin-bottom: 1.5rem;
                    overflow: hidden;
                    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
                    border: 2px solid rgba(255, 255, 255, 0.1);
                }

                .pitch-pattern {
                    position: absolute;
                    inset: 0;
                    display: flex;
                    opacity: 0.15;
                }

                .pattern-stripe {
                    flex: 1;
                    background: linear-gradient(180deg, transparent 0%, rgba(255, 255, 255, 0.05) 100%);
                }

                .pattern-stripe:nth-child(even) {
                    background: linear-gradient(180deg, rgba(0, 0, 0, 0.1) 0%, transparent 100%);
                }

                .pitch-lines {
                    position: absolute;
                    inset: 0;
                    opacity: 0.4;
                }

                .center-circle {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 100px;
                    height: 100px;
                    border: 2px solid white;
                    border-radius: 50%;
                }

                .center-dot {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 8px;
                    height: 8px;
                    background: white;
                    border-radius: 50%;
                }

                .center-line {
                    position: absolute;
                    top: 50%;
                    left: 0;
                    right: 0;
                    height: 2px;
                    background: white;
                }

                .penalty-area {
                    position: absolute;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 140px;
                    height: 70px;
                    border: 2px solid white;
                }

                .penalty-area-top {
                    top: 0;
                    border-top: none;
                }

                .penalty-area-bottom {
                    bottom: 0;
                    border-bottom: none;
                }

                .goal-area {
                    position: absolute;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 70px;
                    height: 35px;
                    border: 2px solid white;
                }

                .goal-area-top {
                    top: 0;
                    border-top: none;
                }

                .goal-area-bottom {
                    bottom: 0;
                    border-bottom: none;
                }

                .formation-badge {
                    position: absolute;
                    top: 1.25rem;
                    right: 1.25rem;
                    padding: 0.75rem 1.25rem;
                    background: rgba(0, 0, 0, 0.7);
                    backdrop-filter: blur(10px);
                    border: 2px solid rgba(0, 255, 135, 0.3);
                    border-radius: 12px;
                    color: white;
                    font-weight: 700;
                    font-size: 0.9375rem;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
                }

                .formation-icon {
                    font-size: 1.125rem;
                }

                .pitch-players {
                    position: relative;
                    z-index: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 2rem;
                }

                .line {
                    display: flex;
                    justify-content: center;
                    gap: 0.5rem;
                    flex-wrap: wrap;
                }

                .bench {
                    background: linear-gradient(145deg, rgba(30, 39, 70, 0.8) 0%, rgba(21, 26, 50, 0.6) 100%);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 20px;
                    padding: 1.75rem;
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
                }

                .bench-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.25rem;
                }

                .bench-title {
                    font-size: 1.125rem;
                    font-weight: 700;
                    color: var(--text-primary);
                    margin: 0;
                    display: flex;
                    align-items: center;
                    gap: 0.625rem;
                }

                .bench-icon {
                    font-size: 1.25rem;
                }

                .bench-count {
                    font-size: 0.8125rem;
                    color: var(--text-muted);
                    padding: 0.375rem 0.875rem;
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 8px;
                    font-weight: 600;
                }

                .bench-players {
                    display: flex;
                    gap: 0.625rem;
                    overflow-x: auto;
                    padding-bottom: 0.75rem;
                    scrollbar-width: thin;
                    scrollbar-color: rgba(0, 255, 135, 0.3) rgba(255, 255, 255, 0.1);
                }

                .bench-players::-webkit-scrollbar {
                    height: 6px;
                }

                .bench-players::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 3px;
                }

                .bench-players::-webkit-scrollbar-thumb {
                    background: rgba(0, 255, 135, 0.3);
                    border-radius: 3px;
                }

                @media (max-width: 768px) {
                    .team-name {
                        font-size: 1.75rem;
                    }

                    .total-points {
                        padding: 1.25rem 2rem;
                    }

                    .points-value {
                        font-size: 2rem;
                    }

                    .pitch {
                        padding: 2rem 0.75rem;
                    }

                    .stats-cards {
                        grid-template-columns: 1fr;
                    }

                    .line {
                        gap: 0.5rem;
                    }
                }

                @media (max-width: 480px) {
                    .team-banner {
                        padding: 1.5rem;
                    }

                    .team-name {
                        font-size: 1.5rem;
                    }

                    .formation-badge {
                        padding: 0.625rem 1rem;
                        font-size: 0.8125rem;
                    }

                    .line {
                        gap: 0.4rem;
                    }
                }
            `}</style>
        </div>
    );
}