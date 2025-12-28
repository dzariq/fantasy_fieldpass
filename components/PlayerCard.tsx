'use client';

import { Player } from '@/types';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface PlayerCardProps {
  player: Player;
  isSelected?: boolean;
  onSelect?: (player: Player) => void;
  onRemove?: (player: Player) => void;
  showPrice?: boolean;
  teamName?: string;
  showSwapButton?: boolean;
  onSwap?: (player: Player) => void;
  showActionButtons?: boolean;
  onCaptainClick?: (player: Player) => void;
  onViceCaptainClick?: (player: Player) => void;
  onViewProfile?: (player: Player) => void;
  allPlayers?: Player[];
  triple?: boolean;
}

export default function PlayerCard({
  player,
  isSelected = false,
  onSelect,
  onRemove,
  showPrice = true,
  teamName,
  showSwapButton = false,
  onSwap,
  showActionButtons = false,
  onCaptainClick,
  onViceCaptainClick,
  onViewProfile,
  allPlayers = [],
  triple = false,
}: PlayerCardProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const positionColors: Record<string, string> = {
    GK: '#FFD700',
    DF: '#00FF87',
    MF: '#00B8FF',
    ST: '#FF2882',
  };

  const getMultiplierDisplay = (): string | null => {
    const multiplier = triple ? 'x3' : 'x2';
    
    if (player.iscaptain === 1 && (player.minutes_played || 0) > 0) {
      return multiplier;
    }
    
    if (player.isvicecaptain === 1 && allPlayers) {
      const allStartingPlayers = [
        ...(allPlayers.gk || []),
        ...(allPlayers.df || []),
        ...(allPlayers.mf || []),
        ...(allPlayers.st || [])
      ];
      
      const captain = allStartingPlayers.find(p => p.iscaptain === 1);
      
      if (captain && (captain.minutes_played || 0) === 0 && (player.minutes_played || 0) > 0) {
        return multiplier;
      }
    }
    
    return null;
  };

  const multiplierDisplay = getMultiplierDisplay();

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // If in selection mode (has onSelect), just select
    if (onSelect && !showActionButtons) {
      onSelect(player);
    } else {
      // Otherwise show modal
      setShowModal(true);
    }
  };

  const handleModalAction = (action: string) => {
    setShowModal(false);
    
    switch(action) {
      case 'remove':
        if (onRemove) onRemove(player);
        break;
      case 'profile':
        if (onViewProfile) onViewProfile(player);
        break;
      case 'swap':
        if (onSwap) onSwap(player);
        break;
      case 'captain':
        if (onCaptainClick) onCaptainClick(player);
        break;
      case 'vice':
        if (onViceCaptainClick) onViceCaptainClick(player);
        break;
    }
  };

  const modalContent = showModal && mounted ? (
    <div className="modal-overlay" onClick={() => setShowModal(false)}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-player-info">
            <div className="modal-player-name">{player.name}</div>
            <div className="modal-player-details">
              {player.position} • {teamName} • ${player.value}
            </div>
          </div>
          <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
        </div>

        <div className="modal-actions">
          {onRemove && (
            <button 
              className="modal-action-btn remove"
              onClick={() => handleModalAction('remove')}
            >
              <span className="action-icon">✕</span>
              <span className="action-text">Transfer Out Player</span>
            </button>
          )}

          {onViewProfile && (
            <button 
              className="modal-action-btn profile"
              onClick={() => handleModalAction('profile')}
            >
              <span className="action-icon">ℹ️</span>
              <span className="action-text">View Player Profile</span>
            </button>
          )}

          {onSwap && (
            <button 
              className="modal-action-btn swap"
              onClick={() => handleModalAction('swap')}
            >
              <span className="action-icon">⇄</span>
              <span className="action-text">Swap Player</span>
            </button>
          )}

          {onCaptainClick && (
            <button 
              className={`modal-action-btn captain ${player.iscaptain === 1 ? 'active' : ''}`}
              onClick={() => handleModalAction('captain')}
            >
              <span className="action-icon">C</span>
              <span className="action-text">
                {player.iscaptain === 1 ? 'Remove as Captain' : 'Set as Captain'}
              </span>
            </button>
          )}

          {onViceCaptainClick && (
            <button 
              className={`modal-action-btn vice ${player.isvicecaptain === 1 ? 'active' : ''}`}
              onClick={() => handleModalAction('vice')}
            >
              <span className="action-icon">V</span>
              <span className="action-text">
                {player.isvicecaptain === 1 ? 'Remove as Vice Captain' : 'Set as Vice Captain'}
              </span>
            </button>
          )}
        </div>
      </div>

      <style jsx>{`
        /* MODAL */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 999999;
          padding: 20px;
          animation: fadeIn 0.2s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .modal-content {
          background: linear-gradient(145deg, rgba(30, 39, 70, 0.95) 0%, rgba(21, 26, 50, 0.95) 100%);
          border: 2px solid rgba(0, 255, 135, 0.3);
          border-radius: 16px;
          max-width: 400px;
          width: 100%;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
          animation: slideUp 0.3s ease;
          overflow: hidden;
        }

        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .modal-player-info {
          flex: 1;
        }

        .modal-player-name {
          font-size: 1.25rem;
          font-weight: 800;
          color: var(--text-primary);
          margin-bottom: 6px;
        }

        .modal-player-details {
          font-size: 0.875rem;
          color: var(--text-muted);
          font-weight: 500;
        }

        .modal-close {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: var(--text-primary);
          font-size: 1.25rem;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.25s ease;
        }

        .modal-close:hover {
          background: rgba(255, 40, 40, 0.9);
          border-color: rgba(255, 40, 40, 0.8);
          transform: scale(1.1);
        }

        .modal-actions {
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .modal-action-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 18px;
          background: rgba(255, 255, 255, 0.05);
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.25s ease;
          width: 100%;
        }

        .modal-action-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.3);
          transform: translateX(4px);
        }

        .action-icon {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.125rem;
          font-weight: 900;
          flex-shrink: 0;
        }

        .action-text {
          font-size: 0.9375rem;
          font-weight: 600;
          color: var(--text-primary);
          text-align: left;
        }

        .modal-action-btn.remove .action-icon {
          background: linear-gradient(135deg, rgba(255, 40, 40, 0.9) 0%, rgba(204, 0, 0, 0.9) 100%);
          color: white;
        }

        .modal-action-btn.remove:hover {
          border-color: rgba(255, 40, 40, 0.5);
        }

        .modal-action-btn.profile .action-icon {
          background: linear-gradient(135deg, rgba(0, 184, 255, 0.9) 0%, rgba(0, 144, 204, 0.9) 100%);
          color: white;
        }

        .modal-action-btn.profile:hover {
          border-color: rgba(0, 184, 255, 0.5);
        }

        .modal-action-btn.swap .action-icon {
          background: linear-gradient(135deg, rgba(0, 255, 135, 0.9) 0%, rgba(0, 204, 106, 0.9) 100%);
          color: #0a0e27;
        }

        .modal-action-btn.swap:hover {
          border-color: rgba(0, 255, 135, 0.5);
        }

        .modal-action-btn.captain .action-icon {
          background: rgba(255, 40, 130, 0.2);
          color: #ff2882;
          border: 2px solid rgba(255, 40, 130, 0.3);
        }

        .modal-action-btn.captain.active .action-icon {
          background: linear-gradient(135deg, rgba(255, 40, 130, 0.95) 0%, rgba(255, 20, 104, 0.95) 100%);
          color: white;
        }

        .modal-action-btn.captain:hover {
          border-color: rgba(255, 40, 130, 0.5);
        }

        .modal-action-btn.vice .action-icon {
          background: rgba(119, 130, 171, 0.2);
          color: #7782ab;
          border: 2px solid rgba(119, 130, 171, 0.3);
        }

        .modal-action-btn.vice.active .action-icon {
          background: linear-gradient(135deg, rgba(119, 130, 171, 0.95) 0%, rgba(93, 106, 156, 0.95) 100%);
          color: white;
        }

        .modal-action-btn.vice:hover {
          border-color: rgba(119, 130, 171, 0.5);
        }

        @media (max-width: 640px) {
          .modal-overlay {
            padding: 12px;
            align-items: flex-end;
          }

          .modal-content {
            max-width: 100%;
            border-radius: 20px 20px 0 0;
          }

          .modal-header {
            padding: 14px 16px;
          }

          .modal-player-name {
            font-size: 1rem;
          }

          .modal-player-details {
            font-size: 0.8125rem;
          }

          .modal-close {
            width: 28px;
            height: 28px;
            font-size: 1.125rem;
          }

          .modal-actions {
            padding: 12px;
            gap: 8px;
          }

          .modal-action-btn {
            padding: 10px 12px;
            gap: 10px;
          }

          .action-icon {
            width: 30px;
            height: 30px;
            font-size: 0.9375rem;
          }

          .action-text {
            font-size: 0.8125rem;
          }
        }
      `}</style>
    </div>
  ) : null;

  return (
    <>
      <div className="player-card-container">
        <div
          className={`player-card ${isSelected ? 'selected' : ''}`}
          onClick={handleClick}
        >
          {/* TOP BADGES ROW */}
          <div className="top-badges">
            {/* POSITION BADGE */}
            <div
              className="position-badge"
              style={{ backgroundColor: positionColors[player.position] }}
            >
              {player.position}
            </div>

            {/* PRICE BADGE */}
            {showPrice && !player.points && (
              <div className="price-badge">
                ${player.value}
              </div>
            )}

            {/* POINTS BADGE */}
            {player.points !== undefined && player.points !== null && (
              <div className="points-badge">
                {player.points}
                {multiplierDisplay && (
                  <span className="multiplier">{multiplierDisplay}</span>
                )}
              </div>
            )}
          </div>

          {/* SUB IN/OUT BADGES */}
          {player.sub_in === 1 && (
            <div className="sub-badge sub-in">
              ↑
            </div>
          )}
          {player.sub_out === 1 && (
            <div className="sub-badge sub-out">
              ↓
            </div>
          )}

          {/* CAPTAIN BADGES */}
          {player.iscaptain === 1 && <div className="captain-badge">C</div>}
          {player.isvicecaptain === 1 && <div className="vice-badge">V</div>}

          {/* SELECTED CHECK */}
          {isSelected && (
            <div className="selected-check">✓</div>
          )}

          {/* JERSEY IMAGE */}
          <div className="img-container">
            {player.team_jersey ? (
              <Image
                src={`${player.team_jersey}`}
                alt={`${teamName} Jersey`}
                width={50}
                height={50}
                className="jersey-img"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/placeholder-jersey.png';
                }}
              />
            ) : (
              <div className="jersey-placeholder">
                <span className="placeholder-icon">👕</span>
              </div>
            )}
          </div>

          {/* INFO */}
          <div className="info">
            <div className="name-bg">
              <h3 className="name">{player.name}</h3>
            </div>
            {player.next_match && (
              <h5 className="next-match">
                {player.next_match}
              </h5>
            )}
          </div>
        </div>
      </div>

      {/* Render modal using portal */}
      {mounted && modalContent && createPortal(modalContent, document.body)}

      <style jsx>{`
        .player-card-container {
          width: 100%;
          max-width: 110px;
          min-width: 85px;
        }

        .player-card {
          position: relative;
          background: linear-gradient(145deg, rgba(30, 39, 70, 0.4) 0%, rgba(21, 26, 50, 0.3) 100%);
          backdrop-filter: blur(10px);
          border: 2px solid rgba(255, 255, 255, 0.15);
          border-radius: 10px;
          padding: 6px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 5px;
          cursor: pointer;
          transition: all 0.25s ease;
          width: 100%;
          box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
        }

        .player-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, 
            rgba(0, 255, 135, 0.03) 0%, 
            transparent 50%
          );
          opacity: 0;
          transition: opacity 0.25s ease;
          border-radius: 10px;
          pointer-events: none;
        }

        .player-card:hover {
          transform: translateY(-2px);
          border-color: rgba(0, 255, 135, 0.4);
          box-shadow: 
            0 5px 15px rgba(0, 255, 135, 0.15),
            0 3px 10px rgba(0, 0, 0, 0.3);
          background: linear-gradient(145deg, rgba(30, 39, 70, 0.6) 0%, rgba(21, 26, 50, 0.5) 100%);
        }

        .player-card:hover::before {
          opacity: 1;
        }

        .player-card.selected {
          border-color: rgba(0, 255, 135, 0.6);
          box-shadow: 
            0 0 0 2px rgba(0, 255, 135, 0.2),
            0 5px 15px rgba(0, 255, 135, 0.25),
            0 3px 10px rgba(0, 0, 0, 0.3);
          background: linear-gradient(145deg, rgba(30, 39, 70, 0.7) 0%, rgba(21, 26, 50, 0.6) 100%);
        }

        /* TOP BADGES ROW */
        .top-badges {
          position: absolute;
          top: 6px;
          left: 6px;
          right: 6px;
          display: flex;
          flex-wrap: wrap;
          gap: 3px;
          z-index: 2;
        }

        /* POSITION BADGE */
        .position-badge {
          padding: 2px 4px;
          border-radius: 4px;
          font-size: 0.4625rem;
          font-weight: 800;
          color: #0a0e27;
          letter-spacing: 0.3px;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
          flex-shrink: 0;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        /* PRICE BADGE */
        .price-badge {
          padding: 2px 2px;
          border-radius: 4px;
          font-size: 0.4625rem;
          font-weight: 800;
          background: linear-gradient(135deg, rgba(0, 255, 135, 0.9) 0%, rgba(0, 204, 106, 0.9) 100%);
          color: #0a0e27;
          letter-spacing: 0.2px;
          box-shadow: 0 1px 4px rgba(0, 255, 135, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.3);
          flex-shrink: 0;
        }

        /* POINTS BADGE */
        .points-badge {
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 0.5625rem;
          font-weight: 800;
          background: linear-gradient(135deg, rgba(168, 85, 247, 0.9) 0%, rgba(124, 58, 237, 0.9) 100%);
          color: white;
          letter-spacing: 0.2px;
          box-shadow: 0 1px 4px rgba(168, 85, 247, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.3);
          display: flex;
          align-items: center;
          gap: 2px;
          flex-shrink: 0;
        }

        /* MULTIPLIER BADGE */
        .multiplier {
          font-size: 0.5rem;
          font-weight: 900;
          background: linear-gradient(135deg, rgba(255, 40, 130, 0.95) 0%, rgba(255, 20, 104, 0.95) 100%);
          color: white;
          padding: 1px 4px;
          border-radius: 3px;
          margin-left: 2px;
          box-shadow: 0 1px 3px rgba(255, 40, 130, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.3);
          animation: pulse-multiplier 2s ease-in-out infinite;
        }

        @keyframes pulse-multiplier {
          0%, 100% {
            box-shadow: 0 1px 3px rgba(255, 40, 130, 0.5);
            transform: scale(1);
          }
          50% {
            box-shadow: 0 2px 6px rgba(255, 40, 130, 0.8);
            transform: scale(1.05);
          }
        }

        /* SUB IN/OUT BADGES */
        .sub-badge {
          position: absolute;
          top: 50px;
          right: 6px;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          font-size: 11px;
          font-weight: 900;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          box-shadow: 0 1px 6px rgba(0, 0, 0, 0.4);
          z-index: 2;
          border: 1.5px solid rgba(255, 255, 255, 0.25);
        }

        .sub-in {
          background: linear-gradient(135deg, rgba(0, 255, 135, 0.9) 0%, rgba(0, 204, 106, 0.9) 100%);
        }

        .sub-out {
          background: linear-gradient(135deg, rgba(255, 107, 107, 0.9) 0%, rgba(238, 90, 82, 0.9) 100%);
        }

        /* CAPTAIN BADGES */
        .captain-badge,
        .vice-badge {
          position: absolute;
          top: 28px;
          right: 6px;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          font-size: 11px;
          font-weight: 900;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          box-shadow: 0 1px 6px rgba(0, 0, 0, 0.4);
          z-index: 2;
          border: 1.5px solid rgba(255, 255, 255, 0.25);
        }

        .captain-badge {
          background: linear-gradient(135deg, rgba(255, 40, 130, 0.95) 0%, rgba(255, 20, 104, 0.95) 100%);
        }

        .vice-badge {
          background: linear-gradient(135deg, rgba(119, 130, 171, 0.95) 0%, rgba(93, 106, 156, 0.95) 100%);
        }

        /* SELECTED CHECK */
        .selected-check {
          position: absolute;
          top: 28px;
          right: 6px;
          background: linear-gradient(135deg, rgba(0, 255, 135, 0.95) 0%, rgba(0, 204, 106, 0.95) 100%);
          color: #0a0e27;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          font-weight: 900;
          font-size: 11px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 1px 8px rgba(0, 255, 135, 0.6);
          z-index: 2;
          animation: popIn 0.3s ease-out;
          border: 1.5px solid rgba(255, 255, 255, 0.3);
        }

        @keyframes popIn {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.2);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        /* JERSEY CONTAINER */
        .img-container {
          width: 58px;
          height: 58px;
          border-radius: 8px;
          overflow: visible;
          position: relative;
          margin-top: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* JERSEY IMAGE */
        .jersey-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          filter: contrast(1.1) brightness(1.05);
        }

        /* JERSEY PLACEHOLDER */
        .jersey-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .placeholder-icon {
          font-size: 2rem;
          opacity: 0.3;
        }

        /* INFO */
        .info {
          text-align: center;
          width: 100%;
        }

        .name-bg {
          background: rgba(0, 0, 0, 0.65);
          backdrop-filter: blur(10px);
          padding: 3px 7px;
          border-radius: 6px;
          width:75px;
          border: 1px solid rgba(255, 255, 255, 0.15);
          display: inline-block;
          max-width: 100%;
        }

        .name {
          font-size: 0.5625rem;
          font-weight: 700;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin: 0;
        }

        .next-match {
          color: #ffd700;
          font-size: 0.5625rem;
          margin-top: 3px;
          font-weight: 500;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
        }

        /* RESPONSIVE - Desktop (larger screens) */
        @media (min-width: 1200px) {
          .player-card-container {
            max-width: 115px;
          }

          .img-container {
            width: 62px;
            height: 62px;
          }

          .placeholder-icon {
            font-size: 2.25rem;
          }
        }

        /* RESPONSIVE - Tablet */
        @media (max-width: 768px) {
          .player-card-container {
            max-width: 95px;
            min-width: 78px;
          }

          .player-card {
            padding: 5px;
            gap: 4px;
          }

          .img-container {
            width: 52px;
            height: 52px;
            margin-top: 18px;
          }

          .modal-content {
            max-width: 90%;
          }
        }

        /* RESPONSIVE - Mobile */
        @media (max-width: 640px) {
          .player-card-container {
            max-width: 85px;
            min-width: 68px;
          }

          .player-card {
            padding: 5px;
            gap: 4px;
          }

          .top-badges {
            gap: 2px;
          }

          .position-badge,
          .price-badge,
          .points-badge {
            padding: 2px 2px;
            font-size: 0.4rem;
          }

          .img-container {
            width: 48px;
            height: 48px;
            margin-top: 16px;
          }

          .name {
            font-size: 0.6rem;
          }

          .next-match {
            font-size: 0.5rem;
          }

          .modal-player-name {
            font-size: 1.125rem;
          }

          .modal-action-btn {
            padding: 12px 16px;
          }

          .action-icon {
            width: 32px;
            height: 32px;
            font-size: 1rem;
          }

          .action-text {
            font-size: 0.875rem;
          }
        }

        /* Extra Small */
        @media (max-width: 480px) {
          .player-card-container {
            max-width: 78px;
            min-width: 62px;
          }

          .player-card {
            padding: 4px;
          }

          .img-container {
            width: 44px;
            height: 44px;
            margin-top: 15px;
          }

          .name {
            font-size: 0.55rem;
          }

          .name-bg {
            padding: 2px 5px;
          }

          .modal-header {
            padding: 16px;
          }

          .modal-actions {
            padding: 12px;
          }
        }
      `}</style>
    </>
  );
}