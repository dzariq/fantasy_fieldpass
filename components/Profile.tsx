'use client';

import { useState } from 'react';

interface ProfileProps {
  name: string;
  manager: string;
  country_code: string;
  phone: string;
  bank_account_name?: string;
  bank?: string;
  bank_account_number?: string;
  onChange: (field: string, value: string) => void;
}

export default function Profile({
  name,
  manager,
  country_code,
  phone,
  bank = '',
  bank_account_name = '',
  bank_account_number = '',
  onChange
}: ProfileProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Malaysian Banks List
  const malaysianBanks = [
    'Affin Bank Berhad',
    'Alliance Bank Malaysia Berhad',
    'AmBank (M) Berhad',
    'Bank Islam Malaysia Berhad',
    'Bank Muamalat Malaysia Berhad',
    'Bank Rakyat',
    'Bank Simpanan Nasional (BSN)',
    'CIMB Bank Berhad',
    'Hong Leong Bank Berhad',
    'HSBC Bank Malaysia Berhad',
    'Maybank / Malayan Banking Berhad',
    'OCBC Bank (Malaysia) Berhad',
    'Public Bank Berhad',
    'RHB Bank Berhad',
    'Standard Chartered Bank Malaysia Berhad',
    'United Overseas Bank (Malaysia) Berhad',
    'Agrobank / Bank Pertanian Malaysia Berhad',
    'Al Rajhi Banking & Investment Corporation (Malaysia) Berhad',
    'Bangkok Bank Berhad',
    'Bank of America Malaysia Berhad',
    'Bank of China (Malaysia) Berhad',
    'CIMB Islamic Bank Berhad',
    'Citibank Berhad',
    'Deutsche Bank (Malaysia) Berhad',
    'Industrial and Commercial Bank of China (Malaysia) Berhad',
    'J.P. Morgan Chase Bank Berhad',
    'Kuwait Finance House (Malaysia) Berhad',
    'MBSB Bank Berhad',
    'Mizuho Bank (Malaysia) Berhad',
    'MUFG Bank (Malaysia) Berhad',
    'Sumitomo Mitsui Banking Corporation Malaysia Berhad',
    'The Bank of Nova Scotia Berhad'
  ];

  return (
    <>
      {/* Profile Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="profile-btn"
        title="Edit Profile"
      >
        Update Profile
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="modal-overlay" onClick={() => setIsOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="modal-header">
              <div className="modal-title-group">
                <span className="modal-icon">⚙️</span>
                <h2 className="modal-title">Team Profile</h2>
              </div>
              <button
                className="modal-close"
                onClick={() => setIsOpen(false)}
                title="Close"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="modal-body">
              {/* Team Information Section */}
              <div className="section-header">
                <span className="section-icon">👥</span>
                <h3 className="section-title">Team Information</h3>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span className="label-icon">🏆</span>
                  Team Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => onChange('name', e.target.value)}
                  className="form-input"
                  placeholder="Enter your team name"
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span className="label-icon">👨‍💼</span>
                  Manager Name
                </label>
                <input
                  type="text"
                  value={manager}
                  onChange={e => onChange('manager', e.target.value)}
                  className="form-input"
                  placeholder="Enter your name"
                />
              </div>

              {/* Contact Information Section */}
              <div className="section-header">
                <span className="section-icon">📱</span>
                <h3 className="section-title">Contact Information</h3>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span className="label-icon">🌍</span>
                  Country Code
                  <span className="readonly-badge">Read-only</span>
                </label>
                <div className="readonly-input-wrapper">
                  <input
                    type="text"
                    value={country_code}
                    readOnly
                    className="form-input readonly"
                  />
                  <span className="readonly-icon">🔒</span>
                </div>
                <span className="helper-text">
                  Contact support to change your country code
                </span>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span className="label-icon">📱</span>
                  Phone Number
                  <span className="readonly-badge">Read-only</span>
                </label>
                <div className="readonly-input-wrapper">
                  <input
                    type="text"
                    readOnly
                    value={phone}
                    className="form-input readonly"
                  />
                  <span className="readonly-icon">🔒</span>
                </div>
                <span className="helper-text">
                  This is your verified WhatsApp number
                </span>
              </div>

              {/* Bank Details Section */}
              <div className="section-header">
                <span className="section-icon">🏦</span>
                <h3 className="section-title">Bank Details</h3>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span className="label-icon">👤</span>
                  Bank Account Name
                </label>
                <input
                  type="text"
                  value={bank_account_name}
                  onChange={e => onChange('bank_account_name', e.target.value)}
                  className="form-input"
                  placeholder="Enter account holder name"
                />
                <span className="helper-text">
                  Name as shown on your bank account
                </span>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span className="label-icon">🏦</span>
                  Bank Name
                </label>
                <select
                  value={bank}
                  onChange={e => onChange('bank', e.target.value)}
                  className="form-select"
                >
                  <option value="">Select your bank</option>
                  {malaysianBanks.map(bank => (
                    <option key={bank} value={bank}>
                      {bank}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span className="label-icon">💳</span>
                  Bank Account Number
                </label>
                <input
                  type="text"
                  value={bank_account_number}
                  onChange={e => {
                    // Only allow numbers
                    const value = e.target.value.replace(/\D/g, '');
                    onChange('bank_account_number', value);
                  }}
                  className="form-input"
                  placeholder="Enter your account number"
                  maxLength={20}
                />
                <span className="helper-text">
                  Enter numbers only (without spaces or dashes)
                </span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="modal-footer">
              <button
                className="modal-btn cancel"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </button>
              <button
                className="modal-btn save"
                onClick={() => setIsOpen(false)}
              >
                <span className="btn-icon">✓</span>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .profile-btn {
          width: 100%;
          padding: 0.75rem 1rem;
          background: var(--bg-card);
          border: 2px solid var(--border);
          border-radius: var(--radius-md);
          color: var(--text-primary);
          font-weight: 700;
          font-size: 0.875rem;
          transition: all var(--transition-base);
          cursor: pointer;
          text-align: center;
          font-family: 'Barlow', sans-serif;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }

        .profile-btn:hover {
          background: var(--bg-tertiary);
          border-color: var(--primary);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 255, 135, 0.2);
        }

        /* Modal Overlay */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(10, 14, 39, 0.85);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: fadeIn 0.2s ease-out;
          padding: 1rem;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        /* Modal Content */
        .modal-content {
          background: var(--bg-secondary);
          border: 2px solid var(--border);
          border-radius: var(--radius-lg);
          max-width: 550px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
          animation: slideUp 0.3s ease-out;
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

        /* Modal Header */
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid var(--border);
          background: var(--bg-card);
        }

        .modal-title-group {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .modal-icon {
          font-size: 1.5rem;
        }

        .modal-title {
          font-size: 1.5rem;
          font-weight: 800;
          color: var(--text-primary);
          margin: 0;
        }

        .modal-close {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--radius-sm);
          background: var(--bg-tertiary);
          color: var(--text-secondary);
          font-size: 1.25rem;
          transition: all var(--transition-base);
          cursor: pointer;
          border: none;
        }

        .modal-close:hover {
          background: var(--accent);
          color: white;
          transform: scale(1.1);
        }

        /* Modal Body */
        .modal-body {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        /* Section Headers */
        .section-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-top: 0.5rem;
          padding-bottom: 0.5rem;
          border-bottom: 2px solid var(--border);
        }

        .section-icon {
          font-size: 1.25rem;
        }

        .section-title {
          font-size: 1rem;
          font-weight: 700;
          color: var(--primary);
          margin: 0;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          font-weight: 700;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .label-icon {
          font-size: 1rem;
        }

        /* Readonly Badge */
        .readonly-badge {
          margin-left: auto;
          padding: 0.125rem 0.5rem;
          background: rgba(255, 180, 0, 0.15);
          color: #ffb400;
          font-size: 0.65rem;
          font-weight: 700;
          border-radius: 4px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border: 1px solid rgba(255, 180, 0, 0.3);
        }

        /* Readonly Input Wrapper */
        .readonly-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .readonly-icon {
          position: absolute;
          right: 1rem;
          font-size: 1.125rem;
          opacity: 0.5;
          pointer-events: none;
        }

        .form-input {
          width: 100%;
          padding: 0.875rem 1rem;
          background: var(--bg-tertiary);
          border: 2px solid var(--border);
          border-radius: var(--radius-md);
          color: var(--text-primary);
          font-size: 1rem;
          font-weight: 500;
          transition: all var(--transition-base);
        }

        /* Select Dropdown */
        .form-select {
          width: 100%;
          padding: 0.875rem 1rem;
          background: var(--bg-tertiary);
          border: 2px solid var(--border);
          border-radius: var(--radius-md);
          color: var(--text-primary);
          font-size: 1rem;
          font-weight: 500;
          transition: all var(--transition-base);
          cursor: pointer;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2300FF87' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 1rem center;
          padding-right: 3rem;
        }

        .form-select:focus {
          outline: none;
          border-color: var(--primary);
          background: var(--bg-secondary);
          box-shadow: 0 0 0 3px rgba(0, 255, 135, 0.1);
        }

        .form-select option {
          background: var(--bg-secondary);
          color: var(--text-primary);
          padding: 0.5rem;
        }

        /* Readonly Input Style */
        .form-input.readonly {
          background: var(--bg-card);
          border-color: rgba(255, 180, 0, 0.3);
          color: var(--text-primary);
          font-weight: 600;
          cursor: not-allowed;
          padding-right: 3rem;
        }

        .form-input.readonly:focus {
          outline: none;
          border-color: rgba(255, 180, 0, 0.5);
          box-shadow: 0 0 0 3px rgba(255, 180, 0, 0.1);
        }

        /* Helper Text */
        .helper-text {
          font-size: 0.75rem;
          color: var(--text-muted);
          font-weight: 500;
          font-style: italic;
          margin-top: -0.25rem;
        }

        .form-input::placeholder {
          color: var(--text-muted);
          opacity: 0.6;
        }

        .form-input:focus {
          outline: none;
          border-color: var(--primary);
          background: var(--bg-secondary);
          box-shadow: 0 0 0 3px rgba(0, 255, 135, 0.1);
        }

        /* Modal Footer */
        .modal-footer {
          display: flex;
          gap: 0.75rem;
          padding: 1.5rem;
          border-top: 1px solid var(--border);
          background: var(--bg-card);
        }

        .modal-btn {
          flex: 1;
          padding: 0.875rem 1.5rem;
          border-radius: var(--radius-md);
          font-weight: 700;
          font-size: 0.875rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          transition: all var(--transition-base);
          cursor: pointer;
          border: 2px solid transparent;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .modal-btn.cancel {
          background: var(--bg-tertiary);
          color: var(--text-secondary);
          border-color: var(--border);
        }

        .modal-btn.cancel:hover {
          background: var(--bg-secondary);
          color: var(--text-primary);
          border-color: var(--text-muted);
        }

        .modal-btn.save {
          background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
          color: var(--bg-primary);
          box-shadow: 0 4px 12px rgba(0, 255, 135, 0.3);
        }

        .modal-btn.save:hover {
          box-shadow: 0 6px 20px rgba(0, 255, 135, 0.5);
          transform: translateY(-2px);
        }

        .modal-btn.save:active {
          transform: translateY(0);
        }

        .btn-icon {
          font-size: 1.125rem;
          font-weight: 800;
        }

        @media (max-width: 640px) {
          .profile-btn {
            padding: 0.625rem 0.875rem;
            font-size: 0.8rem;
          }

          .modal-content {
            margin: 0;
            max-height: 95vh;
          }

          .modal-header {
            padding: 1rem;
          }

          .modal-title {
            font-size: 1.25rem;
          }

          .modal-body {
            padding: 1rem;
          }

          .modal-footer {
            padding: 1rem;
            flex-direction: column;
          }

          .form-input,
          .form-select {
            padding: 0.75rem;
            font-size: 0.875rem;
          }

          .form-input.readonly {
            padding-right: 2.5rem;
          }

          .form-select {
            padding-right: 2.5rem;
            background-position: right 0.75rem center;
          }

          .readonly-icon {
            font-size: 1rem;
            right: 0.75rem;
          }

          .helper-text {
            font-size: 0.7rem;
          }

          .section-title {
            font-size: 0.875rem;
          }
        }
      `}</style>
    </>
  );
}