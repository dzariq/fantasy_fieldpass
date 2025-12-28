'use client';

import { Picks, Player, Team } from '@/types';
import PlayerCard from './PlayerCard';

interface PitchProps {
  formation: string;
  pitch: string;
  gk: Player[];
  df: Player[];
  mf: Player[];
  st: Player[];
  teams: Team[];
  onPlayerClick?: (player: Player) => void;
  onCaptainClick?: (player: Player) => void;
  onViceCaptainClick?: (player: Player) => void;
  onSwap?: (player: Player) => void;
  isEditable?: boolean;
  swapMode?: boolean;
  swapSourcePlayer?: Player | null;
  onViewProfile?: (player: Player) => void;
  triple?: boolean;
  allPlayers?: Picks[];
}

export default function Pitch({
  pitch,
  formation,
  gk,
  df,
  mf,
  st,
  teams,
  onPlayerClick,
  onCaptainClick,
  onViceCaptainClick,
  onSwap,
  isEditable = true,
  swapMode = false,
  swapSourcePlayer = null,
  onViewProfile,
  triple,
  allPlayers = []
}: PitchProps) {
  const getTeamName = (teamId: number): string => {
    const team = teams.find(t => t.id === teamId);
    return team?.short_name || '';
  };

  const renderPlayer = (player: Player, index: number) => {
    const isSwapSource = swapMode && swapSourcePlayer?.id === player.id;
    const isSwapTarget = swapMode;

    return (
      <div 
        key={player.id || index}
        className={`pitch-player ${isSwapSource ? 'swap-source' : ''} ${isSwapTarget ? 'swap-target' : ''}`}
      >
        <PlayerCard
          player={player}
          teamName={getTeamName(player.team_id)}
          onRemove={isEditable ? onPlayerClick : undefined}
          onCaptainClick={onCaptainClick}
          onViceCaptainClick={onViceCaptainClick}
          onSwap={onSwap}
          onViewProfile={onViewProfile}
          allPlayers={allPlayers}
          showActionButtons={isEditable && !swapMode}
          triple={triple || false}
        />

        {swapMode && (
          <>
            {isSwapSource && (
              <div className="swap-badge source">
                <span className="icon">⇄</span>
                <span className="label">Selected</span>
              </div>
            )}
            
            {isSwapTarget && (
              <button
                className="swap-badge target"
                onClick={(e) => {
                  e.stopPropagation();
                  onSwap?.(player);
                }}
              >
                <span className="icon">⇄</span>
                <span className="label">Tap to Swap</span>
              </button>
            )}
          </>
        )}
      </div>
    );
  };

  return (
    <div className="pitch-wrapper">
      <div className="pitch-container">
        <div className={`pitch ${swapMode ? 'swap-mode' : ''}`}>
          {/* Field Lines */}
          <div className="field-lines">
            <div className="center-circle"></div>
            <div className="center-line"></div>
            <div className="penalty-box top"></div>
            <div className="penalty-box bottom"></div>
          </div>

          {/* Formation Grid */}
          <div className="formation">
            {/* Strikers */}
            {st.length > 0 && (
              <div className="line strikers">
                {st.map((player, i) => renderPlayer(player, i))}
              </div>
            )}
            
            {/* Midfielders */}
            {mf.length > 0 && (
              <div className="line midfielders">
                {mf.map((player, i) => renderPlayer(player, i))}
              </div>
            )}
            
            {/* Defenders */}
            {df.length > 0 && (
              <div className="line defenders">
                {df.map((player, i) => renderPlayer(player, i))}
              </div>
            )}
            
            {/* Goalkeeper */}
            {gk.length > 0 && (
              <div className="line goalkeeper">
                {gk.map((player, i) => renderPlayer(player, i))}
              </div>
            )}
          </div>

          {/* Empty State */}
          {!gk.length && !df.length && !mf.length && !st.length && (
            <div className="empty">
              <p>Select players to build your team</p>
              <span>{formation}</span>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .pitch-wrapper {
          width: 100%;
          display: flex;
          justify-content: center;
        }

        .pitch-container {
          width: 100%;
          max-width: 900px;
        }

        .pitch {
          position: relative;
          width: 100%;
          aspect-ratio: 3/4;
          background-image: url('${pitch || '/default-pitch.jpg'}');
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 
            0 8px 32px rgba(0, 0, 0, 0.4),
            inset 0 2px 8px rgba(0, 0, 0, 0.2);
          padding: 2.5rem 1.5rem;
          border: 3px solid rgba(255, 255, 255, 0.1);
          transition: all 0.3s ease;
        }

        .pitch::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, #1a4d2e 0%, #23694a 50%, #1a4d2e 100%);
          background-size: 100% 50px;
          z-index: -1;
        }

        .pitch.swap-mode {
          box-shadow: 
            0 0 0 3px #00ff87,
            0 8px 32px rgba(0, 255, 135, 0.3),
            inset 0 2px 8px rgba(0, 0, 0, 0.2);
        }

        /* Field Lines */
        .field-lines {
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: 0.3;
        }

        .center-line {
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 2px;
          background: white;
        }

        .center-circle {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 120px;
          height: 120px;
          border: 2px solid white;
          border-radius: 50%;
          transform: translate(-50%, -50%);
        }

        .center-circle::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 10px;
          height: 10px;
          background: white;
          border-radius: 50%;
          transform: translate(-50%, -50%);
        }

        .penalty-box {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          width: 60%;
          height: 15%;
          border: 2px solid white;
        }

        .penalty-box.top {
          top: 0;
          border-bottom: none;
        }

        .penalty-box.bottom {
          bottom: 0;
          border-top: none;
        }

        /* Formation */
        .formation {
          position: relative;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: space-evenly;
          z-index: 1;
        }

        .line {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 1.25rem;
          flex-wrap: wrap;
          padding: 0 0.5rem;
        }

        /* Pitch Player Container */
        .pitch-player {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0;
          position: relative;
          transition: transform 0.2s ease;
          width: 145px;
          max-width: 100%;
        }

        .pitch-player:hover {
          transform: scale(1.05);
          z-index: 10;
        }

        /* Swap Effects */
        .pitch-player.swap-source {
          animation: glow-green 1.5s ease-in-out infinite;
        }

        .pitch-player.swap-target {
          animation: glow-pink 1.5s ease-in-out infinite;
        }

        @keyframes glow-green {
          0%, 100% {
            filter: drop-shadow(0 0 10px rgba(0, 255, 135, 0.7));
          }
          50% {
            filter: drop-shadow(0 0 20px rgba(0, 255, 135, 1));
          }
        }

        @keyframes glow-pink {
          0%, 100% {
            filter: drop-shadow(0 0 10px rgba(255, 40, 130, 0.7));
          }
          50% {
            filter: drop-shadow(0 0 20px rgba(255, 40, 130, 1));
          }
        }

        /* Swap Badges */
        .swap-badge {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          padding: 8px 12px;
          border-radius: 12px;
          backdrop-filter: blur(16px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.6);
          font-weight: 700;
          cursor: pointer;
          transition: all 0.25s ease;
          animation: slideIn 0.3s ease-out;
          margin-top: 6px;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .swap-badge.source {
          background: linear-gradient(145deg, 
            rgba(0, 255, 135, 0.97) 0%, 
            rgba(0, 200, 100, 0.95) 100%
          );
          border: 2px solid rgba(0, 255, 135, 0.8);
          color: #0a0e27;
        }

        .swap-badge.target {
          background: linear-gradient(145deg, 
            rgba(255, 40, 130, 0.97) 0%, 
            rgba(255, 20, 100, 0.95) 100%
          );
          border: 2px solid rgba(255, 40, 130, 0.8);
          color: white;
        }

        .swap-badge:hover {
          transform: scale(1.05);
        }

        .swap-badge .icon {
          font-size: 1.4rem;
          font-weight: 800;
        }

        .swap-badge .label {
          font-size: 0.65rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        /* Empty State */
        .empty {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          text-align: center;
          color: rgba(255, 255, 255, 0.3);
        }

        .empty p {
          font-size: 1rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        .empty span {
          font-size: 2rem;
          font-weight: 800;
        }

        /* TABLET RESPONSIVE (768px - 1024px) */
        @media (max-width: 1024px) {
          .pitch-container {
            max-width: 700px;
          }

          .pitch {
            padding: 2rem 1rem;
          }

          .line {
            gap: 1rem;
          }

          .pitch-player {
            width: 130px;
          }

          .center-circle {
            width: 100px;
            height: 100px;
          }
        }

        /* MOBILE RESPONSIVE (below 768px) */
        @media (max-width: 768px) {
          .pitch-container {
            max-width: 100%;
            padding: 0 0rem;
          }

          .pitch {
            padding: 1.5rem 0.75rem;
            border-radius: 12px;
            aspect-ratio: 2/3;
          }

          .line {
            gap: 0.75rem;
            flex-wrap: wrap;
            justify-content: center;
          }

          .pitch-player {
            width: 110px;
          }

          .center-circle {
            width: 80px;
            height: 80px;
          }

          .center-circle::after {
            width: 8px;
            height: 8px;
          }

          .swap-badge {
            padding: 6px 10px;
          }

          .swap-badge .icon {
            font-size: 1.2rem;
          }

          .swap-badge .label {
            font-size: 0.6rem;
          }
        }

        /* SMALL MOBILE (below 480px) */
        @media (max-width: 480px) {
          .pitch {
            padding: 1.00rem 0.2rem;
            aspect-ratio: 7/14;
          }

          .line {
            gap: 0.5rem;
          }

          .pitch-player {
            width: 90px;
          }

          .pitch-player:hover {
            transform: scale(1.02);
          }

          .center-circle {
            width: 60px;
            height: 60px;
          }

          .center-circle::after {
            width: 6px;
            height: 6px;
          }

          .penalty-box {
            width: 70%;
          }

          .swap-badge {
            padding: 5px 8px;
          }

          .swap-badge .icon {
            font-size: 1rem;
          }

          .swap-badge .label {
            font-size: 0.55rem;
          }

          .empty p {
            font-size: 0.875rem;
          }

          .empty span {
            font-size: 1.5rem;
          }
        }

        /* EXTRA SMALL DEVICES (below 360px) */
        @media (max-width: 360px) {
          .pitch {
            padding: 1rem 0.275rem;
          }

          .line {
            gap: 0.375rem;
          }

          .pitch-player {
            width: 75px;
          }
        }
      `}</style>
    </div>
  );
}