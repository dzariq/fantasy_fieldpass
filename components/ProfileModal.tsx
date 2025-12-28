import Profile from './Profile';

interface ProfileModalProps {
    userTeam: any;
    authCountryCode: string;
    authPhone: string;
    onProfileChange: (field: string, value: string) => void;
    onClose: () => void;
}

export default function ProfileModal({
    userTeam,
    authCountryCode,
    authPhone,
    onProfileChange,
    onClose
}: ProfileModalProps) {
    return (
        <div className="profile-modal-overlay">
            <div className="profile-modal">
                <div className="profile-modal-header">
                    <h2>⚽ Complete Your Profile</h2>
                    <p>Please fill in all required fields to continue</p>
                </div>
                <div className="profile-modal-body">
                    <Profile
                        name={userTeam.name || ''}
                        manager={userTeam.manager || ''}
                        country_code={userTeam.country_code || authCountryCode}
                        phone={userTeam.phone || authPhone}
                        bank_account_name={userTeam.bank_account_name || ''}
                        bank_account_number={userTeam.bank_account_number || ''}
                        bank={userTeam.bank || ''}
                        onChange={onProfileChange}
                    />
                </div>
                <div className="profile-modal-footer">
                    <button
                        className="profile-modal-btn"
                        onClick={onClose}
                    >
                        Continue
                    </button>
                </div>
            </div>
        </div>
    );
}