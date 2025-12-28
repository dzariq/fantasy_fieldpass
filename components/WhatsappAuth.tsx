'use client'

import { useState } from 'react';

interface WhatsAppAuthProps {
    onAuthenticated: (phone: string, countryCode: string) => void;
}

const COUNTRIES = [
    { code: '+60', name: '🇲🇾 Malaysia', flag: '🇲🇾' },
    { code: '+65', name: '🇸🇬 Singapore', flag: '🇸🇬' },
    { code: '+62', name: '🇮🇩 Indonesia', flag: '🇮🇩' },
    { code: '+66', name: '🇹🇭 Thailand', flag: '🇹🇭' },
    { code: '+84', name: '🇻🇳 Vietnam', flag: '🇻🇳' },
    { code: '+63', name: '🇵🇭 Philippines', flag: '🇵🇭' },
    { code: '+95', name: '🇲🇲 Myanmar', flag: '🇲🇲' },
    { code: '+856', name: '🇱🇦 Laos', flag: '🇱🇦' },
    { code: '+855', name: '🇰🇭 Cambodia', flag: '🇰🇭' },
    { code: '+673', name: '🇧🇳 Brunei', flag: '🇧🇳' },
];

export default function WhatsAppAuth({ onAuthenticated }: WhatsAppAuthProps) {
    const [countryCode, setCountryCode] = useState('+60');
    const [phone, setPhone] = useState('');
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!phone || phone.length < 7) {
            setError('Please enter a valid phone number');
            return;
        }

        setIsLoading(true);

        try {
            // ✅ Changed to use API route instead of direct call
            const response = await fetch('/api/auth/send-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    country_code: countryCode,
                    phone: phone
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || data.message || 'Failed to send OTP');
            }

            setShowOtpModal(true);
        } catch (err: any) {
            setError(err.message || 'Failed to send OTP. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleOtpChange = (index: number, value: string) => {
        if (value.length > 1) {
            value = value[0];
        }

        if (!/^\d*$/.test(value)) {
            return;
        }

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < 5) {
            const nextInput = document.getElementById(`otp-${index + 1}`);
            nextInput?.focus();
        }
    };

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            const prevInput = document.getElementById(`otp-${index - 1}`);
            prevInput?.focus();
        }
    };

    const handleVerifyOtp = async () => {
        const otpCode = otp.join('');

        if (otpCode.length !== 6) {
            setError('Please enter complete 6-digit OTP');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            // ✅ Changed to use API route instead of direct call
            const response = await fetch('/api/auth/verify-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    country_code: countryCode,
                    phone: phone,
                    otp: otpCode
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || data.message || 'Invalid OTP');
            }

            // Store in localStorage
            localStorage.setItem('fantasy_auth', JSON.stringify({
                phone,
                countryCode,
                authenticated: true,
                timestamp: Date.now()
            }));

            // Callback to parent
            onAuthenticated(phone, countryCode);
        } catch (err: any) {
            setError(err.message || 'Invalid OTP. Please try again.');
            setOtp(['', '', '', '', '', '']);
            document.getElementById('otp-0')?.focus();
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendOtp = async () => {
        setOtp(['', '', '', '', '', '']);
        setError('');
        await handleSendOtp({ preventDefault: () => {} } as React.FormEvent);
    };

    return (
        <div className="auth-container">
            {/* ... rest of your JSX (same as before) */}
            <div className="auth-card">
                <div className="auth-header">
                    <span className="auth-logo">⚽</span>
                    <h1 className="auth-title">Fantasy Football</h1>
                    <p className="auth-subtitle">Sign in with WhatsApp</p>
                </div>

                {!showOtpModal ? (
                    <form onSubmit={handleSendOtp} className="auth-form">
                        <div className="form-group">
                            <label className="form-label">Country</label>
                            <select
                                className="form-select"
                                value={countryCode}
                                onChange={(e) => setCountryCode(e.target.value)}
                            >
                                {COUNTRIES.map(country => (
                                    <option key={country.code} value={country.code}>
                                        {country.name} ({country.code})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Phone Number</label>
                            <div className="phone-input-group">
                                <span className="country-code">{countryCode}</span>
                                <input
                                    type="tel"
                                    className="form-input"
                                    placeholder="123456789"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                                    maxLength={15}
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="error-message">
                                <span className="error-icon">⚠️</span>
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="submit-btn"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <span className="spinner"></span>
                                    Sending OTP...
                                </>
                            ) : (
                                <>
                                    <span className="whatsapp-icon">💬</span>
                                    Send OTP via WhatsApp
                                </>
                            )}
                        </button>
                    </form>
                ) : (
                    <div className="otp-modal">
                        <div className="otp-header">
                            <span className="otp-icon">🔐</span>
                            <h3 className="otp-title">Enter OTP</h3>
                            <p className="otp-subtitle">
                                We sent a 6-digit code to<br />
                                <strong>{countryCode} {phone}</strong>
                            </p>
                        </div>

                        <div className="otp-inputs">
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    id={`otp-${index}`}
                                    type="text"
                                    inputMode="numeric"
                                    pattern="\d*"
                                    maxLength={1}
                                    className="otp-input"
                                    value={digit}
                                    onChange={(e) => handleOtpChange(index, e.target.value)}
                                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                    autoFocus={index === 0}
                                />
                            ))}
                        </div>

                        {error && (
                            <div className="error-message">
                                <span className="error-icon">⚠️</span>
                                {error}
                            </div>
                        )}

                        <button
                            className="submit-btn"
                            onClick={handleVerifyOtp}
                            disabled={isLoading || otp.join('').length !== 6}
                        >
                            {isLoading ? (
                                <>
                                    <span className="spinner"></span>
                                    Verifying...
                                </>
                            ) : (
                                <>
                                    ✓ Verify OTP
                                </>
                            )}
                        </button>

                        <div className="otp-actions">
                            <button
                                className="text-btn"
                                onClick={() => setShowOtpModal(false)}
                                disabled={isLoading}
                            >
                                ← Change Number
                            </button>
                            <button
                                className="text-btn"
                                onClick={handleResendOtp}
                                disabled={isLoading}
                            >
                                Resend OTP
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <style jsx>{`
                /* ... all your existing styles (same as before) */
                .auth-container {
                    position: fixed;
                    inset: 0;
                    background: linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 1rem;
                    z-index: 9999;
                }

                .auth-card {
                    background: var(--bg-card);
                    border: 1px solid var(--border);
                    border-radius: var(--radius-xl);
                    padding: 2rem;
                    max-width: 420px;
                    width: 100%;
                    box-shadow: var(--shadow-xl);
                    animation: slideUp 0.4s ease-out;
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

                .auth-header {
                    text-align: center;
                    margin-bottom: 2rem;
                }

                .auth-logo {
                    font-size: 4rem;
                    display: block;
                    margin-bottom: 1rem;
                    animation: pulse 3s ease-in-out infinite;
                }

                .auth-title {
                    font-size: 2rem;
                    font-weight: 800;
                    color: var(--text-primary);
                    margin-bottom: 0.5rem;
                }

                .auth-subtitle {
                    font-size: 0.875rem;
                    color: var(--text-muted);
                    font-weight: 600;
                }

                .auth-form {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }

                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }

                .form-label {
                    font-size: 0.875rem;
                    font-weight: 700;
                    color: var(--text-secondary);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .form-select,
                .form-input {
                    padding: 0.875rem 1rem;
                    background: var(--bg-tertiary);
                    border: 2px solid var(--border);
                    border-radius: var(--radius-md);
                    color: var(--text-primary);
                    font-size: 1rem;
                    font-weight: 600;
                    transition: all var(--transition-base);
                }

                .form-select:focus,
                .form-input:focus {
                    outline: none;
                    border-color: var(--primary);
                    background: var(--bg-secondary);
                }

                .phone-input-group {
                    display: flex;
                    gap: 0.5rem;
                    align-items: center;
                }

                .country-code {
                    padding: 0.875rem 1rem;
                    background: var(--bg-tertiary);
                    border: 2px solid var(--border);
                    border-radius: var(--radius-md);
                    font-size: 1rem;
                    font-weight: 700;
                    color: var(--text-primary);
                    min-width: 80px;
                    text-align: center;
                }

                .submit-btn {
                    padding: 1rem 1.5rem;
                    background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
                    color: var(--bg-primary);
                    border-radius: var(--radius-md);
                    font-size: 1rem;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    transition: all var(--transition-base);
                    cursor: pointer;
                }

                .submit-btn:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 24px rgba(0, 255, 135, 0.4);
                }

                .submit-btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                .whatsapp-icon {
                    font-size: 1.25rem;
                }

                .error-message {
                    padding: 0.75rem 1rem;
                    background: rgba(255, 40, 130, 0.1);
                    border: 2px solid var(--accent);
                    border-radius: var(--radius-md);
                    color: var(--accent);
                    font-size: 0.875rem;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .error-icon {
                    font-size: 1.25rem;
                }

                .spinner {
                    width: 16px;
                    height: 16px;
                    border: 2px solid rgba(255, 255, 255, 0.3);
                    border-top-color: white;
                    border-radius: 50%;
                    animation: spin 0.6s linear infinite;
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }

                .otp-modal {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }

                .otp-header {
                    text-align: center;
                }

                .otp-icon {
                    font-size: 3rem;
                    display: block;
                    margin-bottom: 1rem;
                }

                .otp-title {
                    font-size: 1.5rem;
                    font-weight: 800;
                    color: var(--text-primary);
                    margin-bottom: 0.5rem;
                }

                .otp-subtitle {
                    font-size: 0.875rem;
                    color: var(--text-muted);
                    line-height: 1.6;
                }

                .otp-inputs {
                    display: grid;
                    grid-template-columns: repeat(6, 1fr);
                    gap: 0.5rem;
                }

                .otp-input {
                    width: 100%;
                    aspect-ratio: 1;
                    padding: 0;
                    background: var(--bg-tertiary);
                    border: 2px solid var(--border);
                    border-radius: var(--radius-md);
                    color: var(--text-primary);
                    font-size: 1.5rem;
                    font-weight: 700;
                    text-align: center;
                    transition: all var(--transition-base);
                }

                .otp-input:focus {
                    outline: none;
                    border-color: var(--primary);
                    background: var(--bg-secondary);
                    transform: scale(1.05);
                }

                .otp-actions {
                    display: flex;
                    justify-content: space-between;
                    gap: 1rem;
                }

                .text-btn {
                    padding: 0.5rem 1rem;
                    background: transparent;
                    color: var(--text-secondary);
                    font-size: 0.875rem;
                    font-weight: 600;
                    transition: all var(--transition-base);
                }

                .text-btn:hover:not(:disabled) {
                    color: var(--primary);
                }

                .text-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                @media (max-width: 640px) {
                    .auth-card {
                        padding: 1.5rem;
                    }

                    .auth-logo {
                        font-size: 3rem;
                    }

                    .auth-title {
                        font-size: 1.5rem;
                    }

                    .otp-inputs {
                        gap: 0.375rem;
                    }

                    .otp-input {
                        font-size: 1.25rem;
                    }
                }
            `}</style>
        </div>
    );
}