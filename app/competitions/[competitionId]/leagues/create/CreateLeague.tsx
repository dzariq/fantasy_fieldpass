'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface CreateLeagueProps {
    competitionId: string;
}

export default function CreateLeague({ competitionId }: CreateLeagueProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [currentMatchweek, setCurrentMatchweek] = useState(1);
    const [leagueType, setLeagueType] = useState<'free' | 'paid'>('free');
    const [formData, setFormData] = useState({
        name: '',
        start_mw: currentMatchweek,
        end_mw: 38,
        max_participants: 20,
        fee: 0,
        winner_1: 0,
        winner_2: 0,
        winner_3: 0,
        winner_4: 0,
        winner_5: 0,
    });

    // Fetch current matchweek
    useEffect(() => {
        async function fetchRules() {
            try {
                const rulesRes = await fetch(`${process.env.NEXT_PUBLIC_FANTASY_API_BASE_URL}/rules?competition_id=${process.env.NEXT_PUBLIC_FANTASY_COMPETITION_ID}`).then(r => r.json());
                setCurrentMatchweek(rulesRes.matchweek);
                setFormData(prev => ({
                    ...prev,
                    start_mw: rulesRes.matchweek
                }));
            } catch (error) {
                console.error('Error fetching rules:', error);
            }
        }
        fetchRules();
    }, []);

    // Update form when league type changes
    useEffect(() => {
        if (leagueType === 'paid') {
            setFormData(prev => ({
                ...prev,
                start_mw: Math.max(currentMatchweek, prev.start_mw),
                end_mw: Math.max(currentMatchweek, prev.start_mw),
                max_participants: Math.max(5, prev.max_participants),
                fee: Math.max(10, prev.fee),
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                fee: 0,
            }));
        }
    }, [leagueType, currentMatchweek]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (leagueType === 'paid') {
            if (formData.fee < 10) {
                alert('Minimum fee for paid leagues is RM 10');
                return;
            }
            if (formData.max_participants < 5) {
                alert('Minimum participants for paid leagues is 5');
                return;
            }
            if (formData.start_mw < currentMatchweek) {
                alert(`Start matchweek must be at least ${currentMatchweek} (current matchweek)`);
                return;
            }
            if (formData.start_mw > formData.end_mw) {
                alert(`Start matchweek cannot be greater than end matchweek`);
                return;
            }
            if (totalPrizeAmount < minRequiredPrize) {
                alert(`Total prize amount (RM ${totalPrizeAmount.toFixed(2)}) must be at least 80% of total collection (RM ${minRequiredPrize.toFixed(2)})`);
                return;
            }
            if (totalPrizeAmount === 0) {
                alert('Please set prize amounts');
                return;
            }
        }

        setIsLoading(true);

        try {
            // Get auth data from localStorage
            const authData = localStorage.getItem('fantasy_auth');
            if (!authData) {
                alert('Please login to continue');
                router.push('/');
                return;
            }

            const { phone } = JSON.parse(authData);

            const timestamp = Date.now().toString();
            const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
            const code = timestamp.slice(-5) + random;

            const payload = {
                competition_id: competitionId,
                code: code,
                name: formData.name,
                start_mw: formData.start_mw,
                end_mw: leagueType === 'paid' ? formData.start_mw : formData.end_mw,
                max_participants: formData.max_participants,
                fee: formData.fee,
                winner_1: formData.winner_1,
                winner_2: formData.winner_2,
                winner_3: formData.winner_3,
                winner_4: formData.winner_4,
                winner_5: formData.winner_5,
                league_type: leagueType,
                creator_id: phone,
                status: leagueType === 'paid' ? 'PENDING PAYMENT' : 'ACTIVE',
                total_collection: totalCollection,
                total_prize: totalPrizeAmount,
                platform_fee_percentage: 6.5,
                amount_to_pay: totalPrizeAmount, // Organizer pays only prize pool
            };

            // POST to n8n webhook
            const response = await fetch('/api/leagues', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                const result = await response.json();
                console.log(result);

                if (Array.isArray(result)) {
                    if (result[0]?.paymentUrl) {
                        window.location.href = result[0].paymentUrl;
                        return;
                    }
                } else if (result.status === 'SUCCESS') {
                    alert('League created successfully!');
                    router.push(`/competitions/${competitionId}/leagues`);
                } else {
                    alert('Failed to create league - ' + result.message);
                }
            } else {
                const error = await response.json();
                alert(error.message || 'Failed to create league');
            }
        } catch (error) {
            console.error('Error creating league:', error);
            alert('Error creating league. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;

        if (type === 'number' && value === '') {
            setFormData(prev => ({
                ...prev,
                [name]: 0
            }));
            return;
        }

        let newValue: string | number = type === 'number' ? Number(value) : value;

        if (leagueType === 'paid') {
            if (name === 'fee') {
                newValue = Number(value);
            }
            if (name === 'max_participants') {
                newValue = Number(value);
            }
            if (name === 'start_mw') {
                const mwValue = Math.max(currentMatchweek, newValue as number);
                setFormData(prev => ({
                    ...prev,
                    start_mw: mwValue,
                    end_mw: mwValue,
                }));
                return;
            }
            if (name === 'end_mw') {
                newValue = formData.start_mw;
            }
        } else {
            // For free leagues
            if (name === 'start_mw') {
                const mwValue = Math.max(currentMatchweek, newValue as number);
                setFormData(prev => ({
                    ...prev,
                    start_mw: mwValue,
                }));
                return;
            }
        }

        setFormData(prev => ({
            ...prev,
            [name]: newValue
        }));
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        if (leagueType === 'paid') {
            if (name === 'fee') {
                const numValue = Number(value);
                if (numValue < 10) {
                    setFormData(prev => ({ ...prev, fee: 10 }));
                }
            }
            if (name === 'max_participants') {
                const numValue = Number(value);
                if (numValue < 5) {
                    setFormData(prev => ({ ...prev, max_participants: 5 }));
                }
            }
            if (name === 'start_mw') {
                const numValue = Number(value);
                if (numValue < currentMatchweek) {
                    setFormData(prev => ({
                        ...prev,
                        start_mw: currentMatchweek,
                        end_mw: currentMatchweek
                    }));
                }
            }
        } else {
            if (name === 'start_mw') {
                const numValue = Number(value);
                if (numValue < currentMatchweek) {
                    setFormData(prev => ({ ...prev, start_mw: currentMatchweek }));
                }
            }
        }
    };

    const totalCollection = (formData.fee || 0) * (formData.max_participants || 0);
    const platformFeePercentage = 6.5;
    const platformFee = totalCollection * (platformFeePercentage / 100);
    const minRequiredPrize = totalCollection * 0.8; // Minimum 80% of total collection
    const totalPrizeAmount = (formData.winner_1 || 0) + (formData.winner_2 || 0) + (formData.winner_3 || 0) + (formData.winner_4 || 0) + (formData.winner_5 || 0);
    const refundAmount = totalCollection - totalPrizeAmount - platformFee; // What organizer gets back

    const isPrizeValid = leagueType === 'free'
        ? true
        : totalPrizeAmount >= minRequiredPrize && totalPrizeAmount > 0;

    return (
        <div className="create-league-page">
            <header className="page-header">
                <button className="back-btn" onClick={() => router.back()}>
                    ← Back
                </button>
                <h1 className="page-title">Create Private League</h1>
            </header>

            <div className="form-container">
                <form onSubmit={handleSubmit} className="league-form">
                    <div className="form-section">
                        <h2 className="section-title">League Type</h2>

                        <div className="type-selector">
                            <button
                                type="button"
                                className={`type-btn ${leagueType === 'free' ? 'active' : ''}`}
                                onClick={() => setLeagueType('free')}
                            >
                                <span className="type-icon">🎮</span>
                                <div className="type-info">
                                    <span className="type-label">Free League</span>
                                    <span className="type-desc">No entry fee, play for fun</span>
                                </div>
                            </button>

                            <button
                                type="button"
                                className="type-btn disabled"
                                disabled
                            >
                                <span className="type-icon">💰</span>
                                <div className="type-info">
                                    <span className="type-label">Paid League</span>
                                    <span className="type-desc">Coming Soon! 🚀</span>
                                </div>
                            </button>
                        </div>

                        {leagueType === 'paid' && (
                            <div className="info-box">
                                <span className="info-icon">ℹ️</span>
                                <div className="info-text">
                                    <strong>Paid League Rules:</strong>
                                    <ul>
                                        <li>Single matchweek only (start = end)</li>
                                        <li>Must start from current matchweek ({currentMatchweek}) or later</li>
                                        <li>Minimum entry fee: RM 10</li>
                                        <li>Minimum participants: 5 players</li>
                                        <li>Prize pool must be at least 80% of total collection</li>
                                        <li>Platform fee: 6.5% of total collection</li>
                                        <li><strong>You pay prize pool upfront, get refund after deadline!</strong></li>
                                    </ul>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="form-section">
                        <h2 className="section-title">League Details</h2>

                        <div className="form-group">
                            <label htmlFor="name">League Name</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Enter league name"
                                required
                                maxLength={50}
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="start_mw">
                                    {leagueType === 'paid' ? 'Matchweek' : 'Start Matchweek'} (min: {currentMatchweek})
                                </label>
                                <input
                                    type="number"
                                    id="start_mw"
                                    name="start_mw"
                                    value={formData.start_mw}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    min={currentMatchweek}
                                    max={38}
                                    required
                                />
                            </div>

                            {leagueType === 'free' && (
                                <div className="form-group">
                                    <label htmlFor="end_mw">End Matchweek</label>
                                    <input
                                        type="number"
                                        id="end_mw"
                                        name="end_mw"
                                        value={formData.end_mw}
                                        onChange={handleChange}
                                        min={formData.start_mw}
                                        max={38}
                                        required
                                    />
                                </div>
                            )}
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="max_participants">
                                    Max Participants {leagueType === 'paid' && '(min: 5)'}
                                </label>
                                <input
                                    type="number"
                                    id="max_participants"
                                    name="max_participants"
                                    value={formData.max_participants}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    min={leagueType === 'paid' ? 5 : 2}
                                    step={1}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="fee">
                                    Entry Fee (RM) {leagueType === 'paid' && '(min: 10)'}
                                </label>
                                <input
                                    type="number"
                                    id="fee"
                                    name="fee"
                                    value={formData.fee}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    min={leagueType === 'paid' ? 10.00 : 0.00}
                                    step={1}
                                    disabled={leagueType === 'free'}
                                    required={leagueType === 'paid'}
                                />
                            </div>
                        </div>
                    </div>

                    {leagueType === 'paid' && (
                        <>

                            {/* Prize Distribution Section */}
                            <div className="form-section">
                                <h2 className="section-title">
                                    Prize Distribution (RM)
                                    {totalPrizeAmount < minRequiredPrize && totalPrizeAmount > 0 && (
                                        <span className="warning-text">
                                            Below 80% minimum (RM {minRequiredPrize.toFixed(2)})
                                        </span>
                                    )}
                                    {totalPrizeAmount === 0 && (
                                        <span className="warning-text">
                                            Please set prize amounts
                                        </span>
                                    )}
                                </h2>

                                <div className="prize-grid">
                                    <div className="form-group">
                                        <label htmlFor="winner_1">🥇 1st Place (RM)</label>
                                        <input
                                            type="number"
                                            id="winner_1"
                                            name="winner_1"
                                            value={formData.winner_1}
                                            onChange={handleChange}
                                            min={0}
                                            step={0.01}
                                            placeholder="0.00"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="winner_2">🥈 2nd Place (RM)</label>
                                        <input
                                            type="number"
                                            id="winner_2"
                                            name="winner_2"
                                            value={formData.winner_2}
                                            onChange={handleChange}
                                            min={0}
                                            step={0.01}
                                            placeholder="0.00"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="winner_3">🥉 3rd Place (RM)</label>
                                        <input
                                            type="number"
                                            id="winner_3"
                                            name="winner_3"
                                            value={formData.winner_3}
                                            onChange={handleChange}
                                            min={0}
                                            step={0.01}
                                            placeholder="0.00"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="winner_4">4th Place (RM)</label>
                                        <input
                                            type="number"
                                            id="winner_4"
                                            name="winner_4"
                                            value={formData.winner_4}
                                            onChange={handleChange}
                                            min={0}
                                            step={0.01}
                                            placeholder="0.00"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="winner_5">5th Place (RM)</label>
                                        <input
                                            type="number"
                                            id="winner_5"
                                            name="winner_5"
                                            value={formData.winner_5}
                                            onChange={handleChange}
                                            min={0}
                                            step={0.01}
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>

                                <div className="prize-summary">
                                    <div className="prize-row">
                                        <span>Minimum Required Prize (80%):</span>
                                        <span className="amount highlight">
                                            RM {minRequiredPrize.toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="prize-row">
                                        <span>Total Prize Amount:</span>
                                        <span className={
                                            totalPrizeAmount >= minRequiredPrize
                                                ? 'amount valid'
                                                : 'amount invalid'
                                        }>
                                            RM {totalPrizeAmount.toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="prize-row">
                                        <span>Status:</span>
                                        <span className={
                                            totalPrizeAmount >= minRequiredPrize
                                                ? 'amount valid'
                                                : 'amount invalid'
                                        }>
                                            {totalPrizeAmount === 0
                                                ? 'Not set'
                                                : totalPrizeAmount < minRequiredPrize
                                                    ? `Too low (need RM ${(minRequiredPrize - totalPrizeAmount).toFixed(2)} more)`
                                                    : '✓ Valid'
                                            }
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Flow Section */}
                            <div className="form-section profit-highlight">
                                <h2 className="section-title">
                                    💎 Payment & Refund Breakdown
                                </h2>

                                <div className="profit-showcase">
                                    <div className="profit-item prize-pool-pay">
                                        <div className="profit-label">💳 You Pay Now (Prize Pool)</div>
                                        <div className="profit-value-big">RM {totalPrizeAmount.toFixed(2)}</div>
                                        <div className="profit-note">Upfront payment to activate league</div>
                                    </div>

                                    <div className="profit-divider-big">↓ After League Ends ↓</div>

                                    <div className="profit-item total-collection">
                                        <div className="profit-label">Total Collection (From Participants)</div>
                                        <div className="profit-value">RM {totalCollection.toFixed(2)}</div>
                                        <div className="profit-note">{formData.max_participants} participants × RM {formData.fee}</div>
                                    </div>

                                    <div className="profit-divider">−</div>

                                    <div className="profit-item platform-fee">
                                        <div className="profit-label">Platform Fee ({platformFeePercentage}%)</div>
                                        <div className="profit-value">RM {platformFee.toFixed(2)}</div>
                                        <div className="profit-note">Service charge deducted</div>
                                    </div>

                                    <div className="profit-divider">=</div>

                                    <div className="profit-item your-refund">
                                        <div className="profit-label">💰 Your Profit</div>
                                        <div className={`profit-value-big ${refundAmount > 0 ? 'positive' : refundAmount < 0 ? 'negative' : ''}`}>
                                            RM {refundAmount.toFixed(2)}
                                        </div>
                                        <div className="profit-note">
                                            {refundAmount > 0 ? 'Paid within 7 days after matchweek completes' : refundAmount < 0 ? 'You need to pay more prizes' : 'No refund'}
                                        </div>
                                    </div>
                                </div>

                                <div className="profit-cta">
                                    <span className="cta-icon">🚀</span>
                                    <div className="cta-text">
                                        <strong>How it works:</strong> 
<ol style={{ margin: '0.5rem 0 0 0', paddingLeft: '1.25rem' }}>
                                            <li>Pay RM {totalPrizeAmount.toFixed(2)} now (prize pool)</li>
                                            <li>Participants join and pay entry fees</li>
                                            <li>After matchweek completes, winners get prize money (by platform automatically)</li>
                                            <li>You get refund: Total FEE collections minus platform fee</li>
                                        </ol>
                                    </div>
                                </div>
                            </div>

                        </>
                    )}

                    <div className="form-section summary">
                        <h2 className="section-title">Summary</h2>
                        <div className="summary-grid">
                            <div className="summary-item">
                                <span className="summary-label">League Type</span>
                                <span className="summary-value">{leagueType === 'paid' ? '💰 Paid' : '🎮 Free'}</span>
                            </div>
                            <div className="summary-item">
                                <span className="summary-label">League Duration</span>
                                <span className="summary-value">
                                    {leagueType === 'paid'
                                        ? `MW ${formData.start_mw}`
                                        : `MW ${formData.start_mw} - ${formData.end_mw}`
                                    }
                                </span>
                            </div>
                            <div className="summary-item">
                                <span className="summary-label">Max Participants</span>
                                <span className="summary-value">{formData.max_participants} teams</span>
                            </div>
                            {leagueType === 'paid' && (
                                <>
                                    <div className="summary-item">
                                        <span className="summary-label">Entry Fee</span>
                                        <span className="summary-value">RM {formData.fee.toFixed(2)}</span>
                                    </div>
                                    <div className="summary-item">
                                        <span className="summary-label">Expected Collection</span>
                                        <span className="summary-value prize">RM {totalCollection.toFixed(2)}</span>
                                    </div>
                                    <div className="summary-item">
                                        <span className="summary-label">Expected Refund</span>
                                        <span className={`summary-value ${refundAmount > 0 ? 'profit' : 'loss'}`}>
                                            RM {refundAmount.toFixed(2)}
                                        </span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="submit-btn"
                        disabled={isLoading || !isPrizeValid}
                    >
                        {isLoading ? 'Creating...' : leagueType === 'paid' ? `Pay RM ${totalPrizeAmount.toFixed(2)} & Create League` : 'Create League'}
                    </button>
                </form>
            </div>

            <style jsx>{`
                .create-league-page {
                    min-height: 100vh;
                    background: linear-gradient(180deg, #0a0e27 0%, #151a32 100%);
                    padding: 1rem;
                }

                .page-header {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    margin-bottom: 2rem;
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

                .page-title {
                    font-size: 1.75rem;
                    font-weight: 800;
                    background: linear-gradient(135deg, #00ff87 0%, #00cc6a 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    margin: 0;
                }

                .form-container {
                    max-width: 800px;
                    margin: 0 auto;
                }

                .league-form {
                    display: flex;
                    flex-direction: column;
                    gap: 2rem;
                }

                .form-section {
                    background: rgba(21, 26, 50, 0.6);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 12px;
                    padding: 1.5rem;
                }

                .section-title {
                    font-size: 1.25rem;
                    font-weight: 700;
                    color: var(--text-primary);
                    margin: 0 0 1.5rem 0;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    flex-wrap: wrap;
                    gap: 0.5rem;
                }

                .warning-text {
                    font-size: 0.875rem;
                    color: #ff6b6b;
                    font-weight: 500;
                }

                .type-selector {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 1rem;
                    margin-bottom: 1rem;
                }

                .type-btn {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 1.25rem;
                    background: rgba(255, 255, 255, 0.05);
                    border: 2px solid rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .type-btn:hover:not(:disabled) {
                    background: rgba(255, 255, 255, 0.08);
                    border-color: rgba(255, 255, 255, 0.2);
                }

                .type-btn.active {
                    background: rgba(0, 255, 135, 0.1);
                    border-color: var(--primary);
                    box-shadow: 0 0 0 3px rgba(0, 255, 135, 0.1);
                }

                .type-btn.disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                    background: rgba(255, 255, 255, 0.03);
                }

                .type-btn.disabled:hover {
                    background: rgba(255, 255, 255, 0.03);
                    border-color: rgba(255, 255, 255, 0.1);
                }

                .type-icon {
                    font-size: 2rem;
                }

                .type-info {
                    display: flex;
                    flex-direction: column;
                    gap: 0.25rem;
                    text-align: left;
                }

                .type-label {
                    font-size: 1rem;
                    font-weight: 700;
                    color: var(--text-primary);
                }

                .type-desc {
                    font-size: 0.8125rem;
                    color: var(--text-muted);
                }

                .info-box {
                    display: flex;
                    gap: 1rem;
                    padding: 1rem;
                    background: rgba(0, 184, 255, 0.1);
                    border: 1px solid rgba(0, 184, 255, 0.3);
                    border-radius: 8px;
                    margin-top: 1rem;
                }

                .info-icon {
                    font-size: 1.5rem;
                    flex-shrink: 0;
                }

                .info-text {
                    font-size: 0.875rem;
                    color: var(--text-primary);
                }

                .info-text ul {
                    margin: 0.5rem 0 0 0;
                    padding-left: 1.25rem;
                }

                .info-text li {
                    margin-bottom: 0.25rem;
                }

                /* Profit Highlight Styles */
                .profit-highlight {
                    background: linear-gradient(135deg, rgba(0, 255, 135, 0.1) 0%, rgba(0, 204, 106, 0.05) 100%);
                    border: 2px solid rgba(0, 255, 135, 0.3);
                    box-shadow: 0 8px 32px rgba(0, 255, 135, 0.15);
                }

                .profit-showcase {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                    margin-bottom: 1.5rem;
                }

                .profit-item {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                    padding: 1.25rem;
                    background: rgba(0, 0, 0, 0.3);
                    border-radius: 10px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }

                .profit-item.prize-pool-pay {
                    background: linear-gradient(135deg, rgba(255, 107, 107, 0.2) 0%, rgba(255, 82, 82, 0.1) 100%);
                    border: 2px solid rgba(255, 107, 107, 0.5);
                    box-shadow: 0 4px 16px rgba(255, 107, 107, 0.2);
                }

                .profit-item.total-collection {
                    background: rgba(0, 184, 255, 0.15);
                    border-color: rgba(0, 184, 255, 0.4);
                }

                .profit-item.platform-fee {
                    background: rgba(156, 39, 176, 0.15);
                    border-color: rgba(156, 39, 176, 0.4);
                }

                .profit-item.your-refund {
                    background: linear-gradient(135deg, rgba(0, 255, 135, 0.2) 0%, rgba(0, 204, 106, 0.1) 100%);
                    border: 2px solid rgba(0, 255, 135, 0.5);
                    box-shadow: 0 4px 16px rgba(0, 255, 135, 0.2);
                }

                .profit-label {
                    font-size: 0.875rem;
                    font-weight: 600;
                    color: rgba(255, 255, 255, 0.7);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .profit-value {
                    font-size: 1.5rem;
                    font-weight: 800;
                    color: var(--text-primary);
                }

                .profit-value-big {
                    font-size: 2.25rem;
                    font-weight: 900;
                    background: linear-gradient(135deg, #00ff87 0%, #00cc6a 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .profit-value-big.positive {
                    background: linear-gradient(135deg, #00ff87 0%, #00cc6a 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .profit-value-big.negative {
                    background: linear-gradient(135deg, #ff6b6b 0%, #ff5252 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .profit-note {
                    font-size: 0.75rem;
                    color: rgba(255, 255, 255, 0.5);
                }

                .profit-divider {
                    text-align: center;
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: rgba(255, 255, 255, 0.3);
                    padding: 0.5rem 0;
                }

                .profit-divider-big {
                    text-align: center;
                    font-size: 1.125rem;
                    font-weight: 700;
                    color: rgba(255, 255, 255, 0.5);
                    padding: 1rem 0;
                    background: rgba(0, 184, 255, 0.1);
                    border-radius: 8px;
                }

                .profit-cta {
                    display: flex;
                    align-items: flex-start;
                    gap: 1rem;
                    padding: 1.25rem;
                    background: linear-gradient(135deg, rgba(0, 255, 135, 0.15) 0%, rgba(0, 204, 106, 0.1) 100%);
                    border: 2px solid rgba(0, 255, 135, 0.4);
                    border-radius: 10px;
                }

                .cta-icon {
                    font-size: 2rem;
                    flex-shrink: 0;
                }

                .cta-text {
                    font-size: 0.9375rem;
                    color: var(--text-primary);
                    line-height: 1.5;
                }

                .cta-text strong {
                    color: var(--primary);
                    display: block;
                    margin-bottom: 0.5rem;
                }

                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }

                .form-row {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 1rem;
                    margin-bottom: 1rem;
                }

                .form-group:not(:last-child) {
                    margin-bottom: 1rem;
                }

                label {
                    font-size: 0.875rem;
                    font-weight: 600;
                    color: var(--text-primary);
                }

                input {
                    padding: 0.75rem;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 8px;
                    color: var(--text-primary);
                    font-size: 0.9375rem;
                    font-weight: 500;
                    transition: all 0.2s ease;
                }

                input:focus {
                    outline: none;
                    border-color: var(--primary);
                    background: rgba(255, 255, 255, 0.08);
                    box-shadow: 0 0 0 3px rgba(0, 255, 135, 0.1);
                }

                input:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                input::placeholder {
                    color: rgba(255, 255, 255, 0.3);
                }

                .prize-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                    gap: 1rem;
                }

                .prize-summary {
                    margin-top: 1.5rem;
                    padding: 1rem;
                    background: rgba(0, 0, 0, 0.3);
                    border-radius: 8px;
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }

                .prize-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-size: 0.9375rem;
                }

                .prize-row .amount {
                    font-weight: 700;
                    color: var(--text-primary);
                }

                .prize-row .amount.valid {
                    color: var(--primary);
                }

                .prize-row .amount.invalid {
                    color: #ff6b6b;
                }

                .prize-row .amount.highlight {
                    color: #ffd700;
                    font-size: 1.0625rem;
                }

                .summary-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 1rem;
                }

                .summary-item {
                    display: flex;
                    flex-direction: column;
                    gap: 0.25rem;
                    padding: 1rem;
                    background: rgba(255, 255, 255, 0.03);
                    border-radius: 8px;
                }

                .summary-label {
                    font-size: 0.75rem;
                    font-weight: 600;
                    color: var(--text-muted);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .summary-value {
                    font-size: 1.125rem;
                    font-weight: 700;
                    color: var(--text-primary);
                }

                .summary-value.prize {
                    color: var(--primary);
                }

                .summary-value.profit {
                    color: var(--primary);
                }

                .summary-value.loss {
                    color: #ff6b6b;
                }

                .submit-btn {
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

                .submit-btn:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(0, 255, 135, 0.5);
                }

                .submit-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                @media (max-width: 768px) {
                    .page-title {
                        font-size: 1.375rem;
                    }

                    .type-selector {
                        grid-template-columns: 1fr;
                    }

                    .form-row {
                        grid-template-columns: 1fr;
                    }

                    .prize-grid {
                        grid-template-columns: 1fr;
                    }

                    .summary-grid {
                        grid-template-columns: 1fr;
                    }

                    .form-section {
                        padding: 1rem;
                    }

                    .profit-value-big {
                        font-size: 1.75rem;
                    }
                }
            `}</style>
        </div>
    );
}