interface SwapModeBannerProps {
    swapSourcePlayer: any;
    onCancel: () => void;
}

export default function SwapModeBanner({ swapSourcePlayer, onCancel }: SwapModeBannerProps) {
    return (
        <div className="swap-mode-banner">
            <div className="swap-mode-content">
                <span className="swap-icon">⇄</span>
                <div className="swap-info">
                    <span className="swap-label">Swap Mode</span>
                    <span className="swap-text">
                        <strong>{swapSourcePlayer.name}</strong> ({swapSourcePlayer.position})
                    </span>
                </div>
                <button className="cancel-swap-btn" onClick={onCancel}>
                    ✕
                </button>
            </div>
        </div>
    );
}