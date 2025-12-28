'use client';

import { Player } from '@/types';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface PlayerCardChooseProps {
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

export default function PlayerCardChoose({
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
}: PlayerCardChooseProps) {
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
      <div className="player-list-card">
        <div
          className={`list-card ${isSelected ? 'selected' : ''}`}
          onClick={handleClick}
        >
          {/* Left Section - Jersey & Info */}
          <div className="left-section">
            {/* Jersey Image */}
            <div className="jersey-container">
              {player.team_jersey ? (
                <Image
                  src={`${player.team_jersey}`}
                  alt={`${teamName} Jersey`}
                  width={60}
                  height={60}
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

            {/* Player Info */}
            <div className="player-info">
              <h3 className="player-name">{player.name}</h3>
              <div className="player-meta">
                <span
                  className="position-badge"
                  style={{ backgroundColor: positionColors[player.position] }}
                >
                  {player.position}
                </span>
                <span className="team-name">{teamName}</span>
              </div>
              {player.next_match && (
                <div className="next-match">{player.next_match}</div>
              )}
            </div>
          </div>

          {/* Right Section - Stats */}
          <div className="right-section">
            {/* Price/Value */}
              <div className="stat-item value">
                <span className="stat-label">Value</span>
                <span className="stat-value">${player.value}</span>
              </div>

            {/* Total Points */}
            <div className="stat-item points">
              <span className="stat-label">Pts</span>
              <span className="stat-value">{player.total_points || 0}</span>
            </div>

            {/* Goals */}
            <div className="stat-item goals">
              <span className="stat-icon">⚽</span>
              <span className="stat-value">{player.goals || 0}</span>
            </div>

            {/* Assists */}
            <div className="stat-item assists">
              <span className="stat-icon">🎯</span>
              <span className="stat-value">{player.assists || 0}</span>
            </div>
          </div>

          {/* Badges */}
          {isSelected && (
            <div className="selected-check">✓</div>
          )}

          {player.iscaptain === 1 && <div className="captain-badge">C</div>}
          {player.isvicecaptain === 1 && <div className="vice-badge">V</div>}
        </div>
      </div>

      {/* Render modal using portal */}
      {mounted && modalContent && createPortal(modalContent, document.body)}

      <style jsx>{`
        .player-list-card {
          width: 100%;
        }

        .list-card {
          position: relative;
          background: linear-gradient(145deg, rgba(30, 39, 70, 0.6) 0%, rgba(21, 26, 50, 0.5) 100%);
          backdrop-filter: blur(10px);
          border: 2px solid rgba(255, 255, 255, 0.15);
          border-radius: 12px;
          padding: 12px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }

        .list-card:hover {
          transform: translateY(-2px);
          border-color: rgba(0, 255, 135, 0.4);
          box-shadow: 
            0 4px 12px rgba(0, 255, 135, 0.2),
            0 2px 8px rgba(0, 0, 0, 0.3);
          background: linear-gradient(145deg, rgba(30, 39, 70, 0.7) 0%, rgba(21, 26, 50, 0.6) 100%);
        }

        .list-card.selected {
          border-color: rgba(0, 255, 135, 0.6);
          box-shadow: 
            0 0 0 2px rgba(0, 255, 135, 0.2),
            0 4px 12px rgba(0, 255, 135, 0.3);
          background: linear-gradient(145deg, rgba(30, 39, 70, 0.8) 0%, rgba(21, 26, 50, 0.7) 100%);
        }

        /* Left Section */
        .left-section {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
          min-width: 0;
        }

        .jersey-container {
          width: 60px;
          height: 60px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .jersey-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          filter: contrast(1.1) brightness(1.05);
        }

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

        .player-info {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .player-name {
          font-size: 1rem;
          font-weight: 800;
          color: var(--text-primary);
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .player-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .position-badge {
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 0.7rem;
          font-weight: 800;
          color: #0a0e27;
          letter-spacing: 0.3px;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .team-name {
          font-size: 0.8125rem;
          color: var(--text-muted);
          font-weight: 600;
        }

        .next-match {
          font-size: 0.75rem;
          color: #ffd700;
          font-weight: 600;
        }

        /* Right Section - Stats */
        .right-section {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-shrink: 0;
        }

        .stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
          min-width: 45px;
        }

        .stat-label {
          font-size: 0.65rem;
          color: var(--text-muted);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .stat-value {
          font-size: 1rem;
          font-weight: 800;
          color: var(--text-primary);
        }

        .stat-icon {
          font-size: 1.25rem;
        }

        .stat-item.value .stat-value {
          color: #ffd700;
        }

        .stat-item.points .stat-value {
          color: var(--primary);
        }

        /* Badges */
        .selected-check {
          position: absolute;
          top: 8px;
          right: 8px;
          background: linear-gradient(135deg, rgba(0, 255, 135, 0.95) 0%, rgba(0, 204, 106, 0.95) 100%);
          color: #0a0e27;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          font-weight: 900;
          font-size: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(0, 255, 135, 0.6);
          z-index: 2;
          animation: popIn 0.3s ease-out;
          border: 2px solid rgba(255, 255, 255, 0.3);
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

        .captain-badge,
        .vice-badge {
          position: absolute;
          top: 36px;
          right: 8px;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          font-size: 12px;
          font-weight: 900;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
          z-index: 2;
          border: 2px solid rgba(255, 255, 255, 0.25);
        }

        .captain-badge {
          background: linear-gradient(135deg, rgba(255, 40, 130, 0.95) 0%, rgba(255, 20, 104, 0.95) 100%);
        }

        .vice-badge {
          background: linear-gradient(135deg, rgba(119, 130, 171, 0.95) 0%, rgba(93, 106, 156, 0.95) 100%);
        }

        /* Responsive - Tablet */
        @media (max-width: 768px) {
          .list-card {
            padding: 10px;
            gap: 10px;
          }

          .jersey-container {
            width: 50px;
            height: 50px;
          }

          .player-name {
            font-size: 0.9375rem;
          }

          .right-section {
            gap: 8px;
          }

          .stat-item {
            min-width: 40px;
          }

          .stat-value {
            font-size: 0.9375rem;
          }

          .stat-icon {
            font-size: 1.125rem;
          }
        }

        /* Responsive - Mobile */
        @media (max-width: 640px) {
          .list-card {
            padding: 8px;
            gap: 8px;
          }

          .left-section {
            gap: 8px;
          }

          .jersey-container {
            width: 45px;
            height: 45px;
          }

          .player-name {
            font-size: 0.875rem;
          }

          .position-badge {
            font-size: 0.625rem;
            padding: 2px 6px;
          }

          .team-name {
            font-size: 0.75rem;
          }

          .next-match {
            font-size: 0.7rem;
          }

          .right-section {
            gap: 6px;
          }

          .stat-item {
            min-width: 35px;
          }

          .stat-label {
            font-size: 0.6rem;
          }

          .stat-value {
            font-size: 0.875rem;
          }

          .stat-icon {
            font-size: 1rem;
          }

          .selected-check {
            width: 20px;
            height: 20px;
            font-size: 10px;
          }

          .captain-badge,
          .vice-badge {
            width: 20px;
            height: 20px;
            font-size: 10px;
            top: 30px;
          }
        }

        /* Extra Small */
        @media (max-width: 480px) {
          .player-meta {
            flex-direction: column;
            align-items: flex-start;
            gap: 2px;
          }

         
        }
      `}</style>
    </>
  );
}