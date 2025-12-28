'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { League } from '@/types';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
interface LeaguesClientProps {
    leagues: League[];
    competitionId: string;
    team_id?: string; // Add team_id to props to check against creator
}

export default function LeaguesClient({ leagues, competitionId, team_id }: LeaguesClientProps) {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [processingPayment, setProcessingPayment] = useState<string | null>(null);
    const [joiningLeague, setJoiningLeague] = useState<string | null>(null);
    const [codeSearch, setCodeSearch] = useState('');
    const [searchedLeague, setSearchedLeague] = useState<League | null>(null);
    const [searchError, setSearchError] = useState('');
    const searchParams = useSearchParams();

     // 🔹 Detect query param ?code=
    useEffect(() => {
        const code = searchParams.get('code');

        if (code) {
            setCodeSearch(code.toUpperCase());

            // Small delay to ensure state is set before search
            setTimeout(() => {
                handleSearchByCode(code);
            }, 0);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams]);

    // Filter and search leagues
    const filteredLeagues = useMemo(() => {
        return leagues.filter(league => {
            const matchesSearch = league.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                league.code.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = filterStatus === 'all' || league.status === filterStatus;

            return matchesSearch && matchesStatus;
        });
    }, [leagues, searchQuery, filterStatus]);

 const handleSearchByCode = async (forcedCode?: string) => {
        var finalCode = forcedCode ?? codeSearch;

        if(codeSearch == '')
        {
            if (!finalCode.trim()) {
                setSearchError('Please enter a league code');
                return;
            }
        }else{
            finalCode = codeSearch;
        }

        setSearchError('');
        setSearchedLeague(null);

        try {
            const response = await fetch(
                `/api/leagues/search?competition_id=${competitionId}&code=${finalCode.trim()}`
            );

            if (!response.ok) {
                throw new Error('League not found');
            }

            const league = await response.json();
            setSearchedLeague(league.leagues[0]);
        } catch (error) {
            console.error('Search error:', error);
            setSearchError('League not found. Please check the code and try again.');
            setSearchedLeague(null);
        }
    };

    const inviteToWhatsApp = (league: any) => {
        const inviteLink = `${window.location.origin}/competitions/${competitionId}/leagues?code=22477372-23216`;

        const message =
            `⚽ *Join my Fantasy League!* ⚽\n\n` +
            `🏆 League: *${league.name}*\n` +
            `🔑 Code: *${league.code}*\n` +
            `📅 Matchweek: MW ${league.start_mw}-${league.end_mw}\n` +
            `💰 Win prizes worth RM ${league.total_prize}` +
            `Entry Fee: ${league.fee}\n\n` +
            `👉 Join here:\n${inviteLink}`;

        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    };


    const handleJoinLeague = async (league: League) => {
        if(!team_id || team_id === ''){
             alert('Please login to join league');
             window.location.replace('/');
            return;
        }
        // Validate that user is not the creator
        // if (league.creator_id === team_id) {
        //     alert('You cannot join your own league!');
        //     return;
        // }

        // Check if user is already a participant
        if (league.participants.some(p => p.phone === team_id)) {
            alert('You are already a member of this league!');
            return;
        }

        // Check if league is full
        if (league.participants.length >= league.max_participants) {
            alert('This league is full!');
            return;
        }

        setJoiningLeague(league.code);



        try {
            const response = await fetch(`/api/leagues/join`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    team_id,
                    competitionId,
                    code: league.code
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to join league');
            }

            const result = await response.json();

            if (Array.isArray(result)) {
                if (result[0]?.paymentUrl) {
                    window.location.href = result[0].paymentUrl;
                    return;
                }
            } else if (result.status === 'SUCCESS') {
                alert('Successfully joined the league!');
                router.refresh();
                setSearchedLeague(null);
                setCodeSearch('');
            } else {
                alert('Failed to join league - ' + result.message);
            }
        } catch (error) {
            console.error('Join error:', error);
            alert('Failed to join league. Please try again.');
        } finally {
            setJoiningLeague(null);
        }
    };

    const handlePayNow = async (e: React.MouseEvent, league: League) => {
        e.stopPropagation();

        setProcessingPayment(league.id);

        try {
            const response = await fetch('/api/leagues', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(league),
            });

            if (!response.ok) {
                throw new Error('Payment failed');
            }

            const result = await response.json();

            if (Array.isArray(result)) {
                if (result[0]?.paymentUrl) {
                    window.location.href = result[0].paymentUrl;
                    return;
                }
            } else if (result.status === 'SUCCESS') {
                alert('League created successfully!');
                router.refresh();
            } else {
                alert('Failed to create league - ' + result.message);
            }
        } catch (error) {
            console.error('Payment error:', error);
            alert('Payment failed. Please try again.');
        } finally {
            setProcessingPayment(null);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'active': return '#00ff87';
            case 'pending payment': return '#ffd700';
            case 'completed': return '#7782ab';
            default: return '#ff6b6b';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
            case 'active': return '🟢';
            case 'pending payment': return '🟡';
            case 'completed': return '🏁';
            default: return '🔴';
        }
    };

    const isCreator = (league: League) => {
        return league.creator_id === team_id;
    };

    const isMember = (league: League) => {
        return !isCreator(league) && league.participants?.some(p => p.phone === team_id);
    };

    return (
        <div className="leagues-page">
            {/* Header */}
            
            <header className="page-header">
                <div className="header-content">
                    <h1 className="page-title">My Private Leagues</h1>
                       <button className="back-btn" onClick={() => router.push('/')}>
                    Home
                </button>
                    <button
                        className="create-btn"
                        onClick={() => router.push(`/competitions/${competitionId}/leagues/create`)}
                    >
                        + Create League
                    </button>
                </div>
            </header>

            {/* Join League by Code Section */}
            <div className="join-league-section">
                <h2 className="section-title">Join a League</h2>
                <div className="code-search-box">
                    <input
                        type="text"
                        placeholder="Enter league code..."
                        value={codeSearch}
                        onChange={(e) => setCodeSearch(e.target.value.toUpperCase())}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearchByCode()}
                    />
                    <button onClick={handleSearchByCode} className="search-code-btn">
                        Search
                    </button>
                </div>

                {searchError && (
                    <div className="search-error">{searchError}</div>
                )}

                {searchedLeague && (
                    <div className="searched-league-card">
                        <div className="status-badge" style={{ borderColor: getStatusColor(searchedLeague.status) }}>
                            <span>{getStatusIcon(searchedLeague.status)}</span>
                            <span style={{ color: getStatusColor(searchedLeague.status) }}>
                                {searchedLeague.status}
                            </span>
                        </div>

                        <div className="league-header">
                            <h3 className="league-name">{searchedLeague.name}</h3>
                            <div className="league-code">
                                <span className="code-label">Code:</span>
                                    {searchedLeague.code}
                            </div>

                        </div>

                        <div className="stats-grid">
                            <div className="stat-item">
                                <span className="stat-icon">👥</span>
                                <div className="stat-info">
                                    <span className="stat-label">Participants</span>
                                    <span className="stat-value">
                                        {searchedLeague.participants?.length}/{searchedLeague.max_participants}
                                    </span>
                                </div>
                            </div>

                            <div className="stat-item">
                                <span className="stat-icon">📅</span>
                                <div className="stat-info">
                                    <span className="stat-label">Duration</span>
                                    <span className="stat-value">
                                        MW {searchedLeague.start_mw}-{searchedLeague.end_mw}
                                    </span>
                                </div>
                            </div>

                            <div className="stat-item">
                                <span className="stat-icon">💰</span>
                                <div className="stat-info">
                                    <span className="stat-label">Entry Fee</span>
                                    <span className="stat-value">${searchedLeague.fee}</span>
                                </div>
                            </div>

                            <div className="stat-item">
                                <span className="stat-icon">🏆</span>
                                <div className="stat-info">
                                    <span className="stat-label">Prize Pool</span>
                                    <span className="stat-value prize">
                                        ${searchedLeague.total_prize.toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="owner-badge">
                            <span className="owner-icon">👑</span>
                            <span className="owner-text">Created by {searchedLeague.owner}</span>
                        </div>

                        {searchedLeague.participants?.some(p => p.phone === team_id) ? (
                            <div className="info-message">
                                ✅ You are already a member
                            </div>
                        ) : searchedLeague.participants?.length >= searchedLeague.max_participants ? (
                            <div className="error-message">
                                ⚠️ League is full
                            </div>
                        ) : (
                            <button
                                className="join-btn"
                                onClick={() => handleJoinLeague(searchedLeague)}
                                disabled={joiningLeague === searchedLeague.id}
                            >
                                {joiningLeague === searchedLeague.id ? '⏳ Joining...' : '🚀 Join League'}
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Search & Filters */}
            <div className="controls">
                <div className="search-box">
                    <span className="search-icon">🔍</span>
                    <input
                        type="text"
                        placeholder="Search your leagues..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="filters">
                    <button
                        className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
                        onClick={() => setFilterStatus('all')}
                    >
                        All
                    </button>
                    <button
                        className={`filter-btn ${filterStatus === 'ACTIVE' ? 'active' : ''}`}
                        onClick={() => setFilterStatus('ACTIVE')}
                    >
                        Active
                    </button>
                    <button
                        className={`filter-btn ${filterStatus === 'PENDING PAYMENT' ? 'active' : ''}`}
                        onClick={() => setFilterStatus('PENDING PAYMENT')}
                    >
                        Pending Payment
                    </button>
                    <button
                        className={`filter-btn ${filterStatus === 'COMPLETED' ? 'active' : ''}`}
                        onClick={() => setFilterStatus('COMPLETED')}
                    >
                        Completed
                    </button>
                </div>
            </div>

            {/* Leagues Grid */}
            <div className="leagues-grid">
                {filteredLeagues.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">🏆</div>
                        <h3>No leagues found</h3>
                        <p>
                            {searchQuery || filterStatus !== 'all'
                                ? 'Try adjusting your search or filters'
                                : 'Create your first private league to get started!'
                            }
                        </p>
                        {!searchQuery && filterStatus === 'all' && (
                            <button
                                className="create-btn-empty"
                                onClick={() => router.push('/leagues/create')}
                            >
                                + Create League
                            </button>
                        )}
                    </div>
                ) : (
                    filteredLeagues.map((league) => (
                        <div
                            key={league.id}
                            className="league-card"
                            onClick={() => router.push(`/leagues/${competitionId}/${league.code}/info`)}
                        >
                            {/* Role Badge - Creator or Member */}
                            {isCreator(league) && (
                                <div className="role-badge creator-badge-card">
                                    <span>👑</span>
                                    <span>Creator</span>
                                </div>
                            )}
                            {isMember(league) && (
                                <div className="role-badge member-badge-card">
                                    <span>👤</span>
                                    <span>Member</span>
                                </div>
                            )}

                            {/* Status Badge */}
                            <div className="status-badge" style={{ borderColor: getStatusColor(league.status) }}>
                                <span>{getStatusIcon(league.status)}</span>
                                <span style={{ color: getStatusColor(league.status) }}>
                                    {league.status}
                                </span>
                            </div>

                            <div className="league-header">
                                <h3 className="league-name">{league.name}</h3>
                                <div className="league-code">
                                    <span className="code-label">Code:</span>
                                    <span className="code-value">{league.code}</span>
                                </div>
                            </div>

                            <div className="stats-grid">
                                <div className="stat-item">
                                    <span className="stat-icon">👥</span>
                                    <div className="stat-info">
                                        <span className="stat-label">Participants</span>
                                        <span className="stat-value">
                                            {league.participants.length}/{league.max_participants}
                                        </span>
                                    </div>
                                </div>

                                <div className="stat-item">
                                    <span className="stat-icon">📅</span>
                                    <div className="stat-info">
                                        <span className="stat-label">Duration</span>
                                        <span className="stat-value">
                                            MW {league.start_mw}-{league.end_mw}
                                        </span>
                                    </div>
                                </div>

                                <div className="stat-item">
                                    <span className="stat-icon">💰</span>
                                    <div className="stat-info">
                                        <span className="stat-label">Entry Fee</span>
                                        <span className="stat-value">${league.fee}</span>
                                    </div>
                                </div>

                                <div className="stat-item">
                                    <span className="stat-icon">🏆</span>
                                    <div className="stat-info">
                                        <span className="stat-label">Prize Pool</span>
                                        <span className="stat-value prize">
                                            ${league.total_prize || 0}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="owner-badge">
                                <span className="owner-icon">👑</span>
                                <span className="owner-text">Created by {league.owner}</span>
                            </div>
                            <button className="view-btn">
                                View League →
                            </button>
{isCreator(league) && (

                            <button  onClick={(e) => {
                                    e.stopPropagation();
                                    inviteToWhatsApp(league);
                                }} className="invite-btn">
                                Invite  →
                            </button>
)}

                            {league.status === 'PENDING PAYMENT' && (
                                <div>
                                    <br />
                                    <button
                                        className="pay-now-btn"
                                        onClick={(e) => handlePayNow(e, league)}
                                        disabled={processingPayment === league.id}
                                    >
                                        {processingPayment === league.id ? '⏳ Processing...' : '💳 Pay Now'}
                                    </button>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            <style jsx>{`
                .leagues-page {
                    min-height: 100vh;
                    background: linear-gradient(180deg, #0a0e27 0%, #151a32 100%);
                    padding: 1rem;
                }

                /* Header */
                .page-header {
                    margin-bottom: 2rem;
                }

                .header-content {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 1rem;
                    flex-wrap: wrap;
                }

                .page-title {
                    font-size: 1.75rem;
                    font-weight: 800;
                    background: linear-gradient(135deg, #00ff87 0%, #00cc6a 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    margin: 0;
                }

                .create-btn {
                    padding: 0.75rem 1.5rem;
                    background: linear-gradient(135deg, var(--primary) 0%, #00cc6a 100%);
                    border: none;
                    border-radius: 8px;
                    color: #0a0e27;
                    font-size: 0.9375rem;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    box-shadow: 0 4px 12px rgba(0, 255, 135, 0.3);
                }

                .create-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 16px rgba(0, 255, 135, 0.5);
                }

                /* Join League Section */
                .join-league-section {
                    background: linear-gradient(145deg, rgba(30, 39, 70, 0.6) 0%, rgba(21, 26, 50, 0.5) 100%);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 12px;
                    padding: 1.5rem;
                    margin-bottom: 2rem;
                }

                .section-title {
                    font-size: 1.25rem;
                    font-weight: 700;
                    color: var(--text-primary);
                    margin: 0 0 1rem 0;
                }

                .code-search-box {
                    display: flex;
                    gap: 0.75rem;
                    margin-bottom: 1rem;
                }

                .code-search-box input {
                    flex: 1;
                    padding: 0.875rem 1rem;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 8px;
                    color: var(--text-primary);
                    font-size: 1rem;
                    font-weight: 600;
                    text-transform: uppercase;
                    font-family: 'Courier New', monospace;
                    letter-spacing: 2px;
                    transition: all 0.2s ease;
                }

                .code-search-box input:focus {
                    outline: none;
                    border-color: var(--primary);
                    background: rgba(255, 255, 255, 0.08);
                    box-shadow: 0 0 0 3px rgba(0, 255, 135, 0.1);
                }

                .code-search-box input::placeholder {
                    color: rgba(255, 255, 255, 0.3);
                    text-transform: none;
                    letter-spacing: normal;
                }

                .search-code-btn {
                    padding: 0.875rem 2rem;
                    background: linear-gradient(135deg, var(--primary) 0%, #00cc6a 100%);
                    border: none;
                    border-radius: 8px;
                    color: #0a0e27;
                    font-size: 0.9375rem;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    box-shadow: 0 4px 12px rgba(0, 255, 135, 0.3);
                    white-space: nowrap;
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
                }

                .back-btn:hover {
                    background: rgba(255, 255, 255, 0.08);
                    border-color: var(--primary);
                }
                .search-code-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 16px rgba(0, 255, 135, 0.5);
                }

                .search-error {
                    padding: 0.75rem 1rem;
                    background: rgba(255, 107, 107, 0.1);
                    border: 1px solid rgba(255, 107, 107, 0.3);
                    border-radius: 8px;
                    color: #ff6b6b;
                    font-size: 0.875rem;
                    margin-top: 0.5rem;
                }

                .searched-league-card {
                    position: relative;
                    background: linear-gradient(145deg, rgba(40, 49, 80, 0.6) 0%, rgba(31, 36, 60, 0.5) 100%);
                    border: 1px solid rgba(0, 255, 135, 0.3);
                    border-radius: 12px;
                    padding: 1.5rem;
                    margin-top: 1rem;
                }

                .info-message {
                    padding: 0.875rem;
                    background: rgba(0, 255, 135, 0.1);
                    border: 1px solid rgba(0, 255, 135, 0.3);
                    border-radius: 8px;
                    color: var(--primary);
                    font-size: 0.9375rem;
                    font-weight: 600;
                    text-align: center;
                }

                .error-message {
                    padding: 0.875rem;
                    background: rgba(255, 107, 107, 0.1);
                    border: 1px solid rgba(255, 107, 107, 0.3);
                    border-radius: 8px;
                    color: #ff6b6b;
                    font-size: 0.9375rem;
                    font-weight: 600;
                    text-align: center;
                }

                .join-btn {
                    width: 100%;
                    padding: 0.875rem;
                    background: linear-gradient(135deg, var(--primary) 0%, #00cc6a 100%);
                    border: none;
                    border-radius: 8px;
                    color: #0a0e27;
                    font-size: 0.9375rem;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    box-shadow: 0 4px 12px rgba(0, 255, 135, 0.3);
                }

                .join-btn:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 16px rgba(0, 255, 135, 0.5);
                }

                .join-btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                .invite-btn {
    width: 100%;
    margin-top: 0.75rem;
    padding: 0.75rem 1rem;
    background: linear-gradient(135deg, #25D366, #1ebe5d);
    border: none;
    border-radius: 10px;
    color: white;
    font-weight: 700;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s ease;
}

.invite-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(37, 211, 102, 0.4);
}

.invite-btn:active {
    transform: translateY(0);
}


                /* Controls */
                .controls {
                    display: flex;
                    gap: 1rem;
                    margin-bottom: 2rem;
                    flex-wrap: wrap;
                }

                .search-box {
                    flex: 1;
                    min-width: 250px;
                    position: relative;
                    display: flex;
                    align-items: center;
                }

                .search-icon {
                    position: absolute;
                    left: 1rem;
                    font-size: 1rem;
                }
                    .invite-code {
    cursor: pointer;
    color: var(--primary);
    font-weight: 700;
    text-decoration: underline;
}

.invite-code:hover {
    opacity: 0.85;
}


                .search-box input {
                    width: 100%;
                    padding: 0.75rem 1rem 0.75rem 2.75rem;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 8px;
                    color: var(--text-primary);
                    font-size: 0.9375rem;
                    transition: all 0.2s ease;
                }

                .search-box input:focus {
                    outline: none;
                    border-color: var(--primary);
                    background: rgba(255, 255, 255, 0.08);
                    box-shadow: 0 0 0 3px rgba(0, 255, 135, 0.1);
                }

                .search-box input::placeholder {
                    color: rgba(255, 255, 255, 0.3);
                }

                .filters {
                    display: flex;
                    gap: 0.5rem;
                }

                .filter-btn {
                    padding: 0.75rem 1.25rem;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 8px;
                    color: var(--text-primary);
                    font-size: 0.875rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .filter-btn:hover {
                    background: rgba(255, 255, 255, 0.08);
                    border-color: rgba(255, 255, 255, 0.2);
                }

                .filter-btn.active {
                    background: linear-gradient(135deg, var(--primary) 0%, #00cc6a 100%);
                    border-color: var(--primary);
                    color: #0a0e27;
                }

                /* Leagues Grid */
                .leagues-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
                    gap: 1.5rem;
                }

                /* League Card */
                .league-card {
                    position: relative;
                    background: linear-gradient(145deg, rgba(30, 39, 70, 0.6) 0%, rgba(21, 26, 50, 0.5) 100%);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 12px;
                    padding: 1.5rem;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .league-card::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(135deg, 
                        rgba(0, 255, 135, 0.05) 0%, 
                        transparent 50%
                    );
                    opacity: 0;
                    transition: opacity 0.3s ease;
                    border-radius: 12px;
                    pointer-events: none;
                }

                .league-card:hover {
                    transform: translateY(-4px);
                    border-color: rgba(0, 255, 135, 0.3);
                    box-shadow: 0 8px 24px rgba(0, 255, 135, 0.15);
                }

                .league-card:hover::before {
                    opacity: 1;
                }

                /* Role Badge */
                .role-badge {
                    position: absolute;
                    top: 1rem;
                    left: 1rem;
                    display: flex;
                    align-items: center;
                    gap: 0.375rem;
                    padding: 0.375rem 0.75rem;
                    border-radius: 20px;
                    font-size: 0.75rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    backdrop-filter: blur(10px);
                    z-index: 1;
                }

                .creator-badge-card {
                    background: rgba(255, 215, 0, 0.2);
                    border: 1px solid rgba(255, 215, 0, 0.5);
                    color: #ffd700;
                }

                .member-badge-card {
                    background: rgba(0, 191, 255, 0.2);
                    border: 1px solid rgba(0, 191, 255, 0.5);
                    color: #00bfff;
                }

                /* Status Badge */
                .status-badge {
                    position: absolute;
                    top: 1rem;
                    right: 1rem;
                    display: flex;
                    align-items: center;
                    gap: 0.375rem;
                    padding: 0.375rem 0.75rem;
                    background: rgba(0, 0, 0, 0.4);
                    border: 1px solid;
                    border-radius: 20px;
                    font-size: 0.75rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    backdrop-filter: blur(10px);
                }

                /* League Header */
           /* League Header */
.league-header {
    margin-bottom: 1.5rem;
    margin-top: 2rem; /* Add space for badges */
}

                .league-name {
                    font-size: 1.25rem;
                    font-weight: 800;
                    color: var(--text-primary);
                    margin: 0 0 0.5rem 0;
                    line-height: 1.3;
                }

                .league-code {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.5rem 0.75rem;
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 6px;
                    width: fit-content;
                }

                .code-label {
                    font-size: 0.75rem;
                    font-weight: 600;
                    color: var(--text-muted);
                }

                .code-value {
                    font-size: 0.875rem;
                    font-weight: 800;
                    color: var(--primary);
                    font-family: 'Courier New', monospace;
                }

                /* Stats Grid */
                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 1rem;
                    margin-bottom: 1rem;
                }

                .stat-item {
                    display: flex;
                    align-items: center;
                    gap: 0.625rem;
                    padding: 0.75rem;
                    background: rgba(255, 255, 255, 0.03);
                    border-radius: 8px;
                }

                .stat-icon {
                    font-size: 1.25rem;
                }

                .stat-info {
                    display: flex;
                    flex-direction: column;
                    gap: 0.125rem;
                }

                .stat-label {
                    font-size: 0.6875rem;
                    font-weight: 600;
                    color: var(--text-muted);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .stat-value {
                    font-size: 0.9375rem;
                    font-weight: 700;
                    color: var(--text-primary);
                }

                .stat-value.prize {
                    color: var(--primary);
                }

                /* Owner Badge */
                .owner-badge {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.625rem 0.875rem;
                    background: rgba(255, 215, 0, 0.1);
                    border: 1px solid rgba(255, 215, 0, 0.3);
                    border-radius: 6px;
                    margin-bottom: 1rem;
                }

                .owner-icon {
                    font-size: 1rem;
                }

                .owner-text {
                    font-size: 0.8125rem;
                    font-weight: 600;
                    color: var(--text-primary);
                }

                /* View Button */
                .view-btn {
                    width: 100%;
                    padding: 0.875rem;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 8px;
                    color: var(--text-primary);
                    font-size: 0.9375rem;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .view-btn:hover {
                    background: rgba(0, 255, 135, 0.1);
                    border-color: var(--primary);
                    color: var(--primary);
                }

                /* Pay Now Button */
                .pay-now-btn {
                    width: 100%;
                    padding: 0.875rem;
                    background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
                    border: none;
                    border-radius: 8px;
                    color: #0a0e27;
                    font-size: 0.9375rem;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    box-shadow: 0 4px 12px rgba(255, 215, 0, 0.3);
                }

                .pay-now-btn:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 16px rgba(255, 215, 0, 0.5);
                }

                .pay-now-btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                /* Empty State */
                .empty-state {
                    grid-column: 1 / -1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 4rem 2rem;
                    text-align: center;
                }

                .empty-icon {
                    font-size: 4rem;
                    margin-bottom: 1rem;
                    opacity: 0.5;
                }

                .empty-state h3 {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: var(--text-primary);
                    margin: 0 0 0.5rem 0;
                }

                .empty-state p {
                    font-size: 0.9375rem;
                    color: var(--text-muted);
                    margin: 0 0 2rem 0;
                }

                .create-btn-empty {
                    padding: 1rem 2rem;
                    background: linear-gradient(135deg, var(--primary) 0%, #00cc6a 100%);
                    border: none;
                    border-radius: 10px;
                    color: #0a0e27;
                    font-size: 1rem;
                    font-weight: 800;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    box-shadow: 0 4px 16px rgba(0, 255, 135, 0.3);
                }

                .create-btn-empty:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(0, 255, 135, 0.5);
                }

                /* Responsive */
                @media (max-width: 768px) {
                    .page-title {
                        font-size: 1.375rem;
                    }

                    .header-content {
                        flex-direction: column;
                        align-items: stretch;
                    }

                    .create-btn {
                        width: 100%;
                    }

                    .code-search-box {
                        flex-direction: column;
                    }

                    .search-code-btn {
                        width: 100%;
                    }

                    .controls {
                        flex-direction: column;
                    }

                    .filters {
                        flex-wrap: wrap;
                    }

                    .leagues-grid {
                        grid-template-columns: 1fr;
                    }

                    .stats-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </div>
    );
}