'use client';

import { useState, useEffect } from 'react';

interface CountdownTimerProps {
  deadline: string; // Unix timestamp in seconds
  matchweek: number;
  onDeadlineReached?: () => void;
}

export default function CountdownTimer({ deadline, matchweek, onDeadlineReached }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isExpired: boolean;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: false });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const deadlineMs = parseInt(deadline) * 1000;
      const now = Date.now();
      const difference = deadlineMs - now;

      if (difference <= 0) {
        if (!timeLeft.isExpired && onDeadlineReached) {
          onDeadlineReached();
        }
        return {
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isExpired: true
        };
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
        isExpired: false
      };
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [deadline, onDeadlineReached]);

  const formatNumber = (num: number) => String(num).padStart(2, '0');

  return (
    <div className="countdown-timer">
      <div className="countdown-header">
        {/* <span className="countdown-label">MW {matchweek} Deadline</span> */}
        {timeLeft.isExpired && <span className="locked-badge">🔒 LOCKED</span>}
      </div>
      
      {!timeLeft.isExpired ? (
        <div className="countdown-display">
          <div className="time-unit">
            <span className="time-value">{formatNumber(timeLeft.days)}</span>
            <span className="time-label">D</span>
          </div>
          <div className="time-separator">:</div>
          <div className="time-unit">
            <span className="time-value">{formatNumber(timeLeft.hours)}</span>
            <span className="time-label">H</span>
          </div>
          <div className="time-separator">:</div>
          <div className="time-unit">
            <span className="time-value">{formatNumber(timeLeft.minutes)}</span>
            <span className="time-label">M</span>
          </div>
          <div className="time-separator">:</div>
          <div className="time-unit">
            <span className="time-value">{formatNumber(timeLeft.seconds)}</span>
            <span className="time-label">S</span>
          </div>
        </div>
      ) : (
        <div className="deadline-expired">
          <span className="expired-icon">⏰</span>
          <span className="expired-text">Locked</span>
        </div>
      )}

      <style jsx>{`
        .countdown-timer {
          background: linear-gradient(135deg, var(--bg-card) 0%, var(--bg-tertiary) 100%);
          border: 2px solid ${timeLeft.isExpired ? 'var(--accent)' : 'var(--primary)'};
          border-radius: var(--radius-md);
          padding: 0.75rem;
          box-shadow: var(--shadow-sm);
        }

        .countdown-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .countdown-label {
          font-size: 0.7rem;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .locked-badge {
          background: var(--accent);
          color: white;
          padding: 0.2rem 0.5rem;
          border-radius: var(--radius-sm);
          font-size: 0.65rem;
          font-weight: 800;
          letter-spacing: 0.3px;
        }

        .countdown-display {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 0.375rem;
        }

        .time-unit {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.125rem;
          flex: 1;
          background: var(--bg-secondary);
          padding: 0.5rem 0.375rem;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border);
        }

        .time-value {
          font-size: 1.25rem;
          font-weight: 800;
          color: var(--primary);
          font-family: 'Barlow', sans-serif;
          line-height: 1;
        }

        .time-label {
          font-size: 0.6rem;
          color: var(--text-muted);
          text-transform: uppercase;
          font-weight: 600;
          letter-spacing: 0.3px;
        }

        .time-separator {
          font-size: 1.125rem;
          font-weight: 700;
          color: var(--text-muted);
          margin: 0 -0.125rem;
        }

        .deadline-expired {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem;
          background: rgba(255, 40, 130, 0.1);
          border-radius: var(--radius-sm);
        }

        .expired-icon {
          font-size: 1.5rem;
        }

        .expired-text {
          font-size: 0.875rem;
          font-weight: 700;
          color: var(--accent);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        @media (max-width: 640px) {
          .countdown-timer {
            padding: 0.25rem;
          }

          .countdown-header {
            margin-bottom: 0.375rem;
          }

          .countdown-label {
            font-size: 0.65rem;
          }

          .locked-badge {
            font-size: 0.6rem;
            padding: 0.15rem 0.4rem;
          }

          .countdown-display {
            gap: 0.25rem;
          }

          .time-unit {
            padding: 0.375rem 0.25rem;
          }

          .time-value {
            font-size: 1rem;
          }

          .time-label {
            font-size: 0.55rem;
          }

          .time-separator {
            font-size: 1rem;
            margin: 0 -0.25rem;
          }

          .deadline-expired {
            padding: 0.625rem;
          }

          .expired-icon {
            font-size: 1.25rem;
          }

          .expired-text {
            font-size: 0.75rem;
          }
        }
      `}</style>
    </div>
  );
}