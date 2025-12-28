'use client';

interface FormationSelectorProps {
  currentFormation: string;
  onFormationChange: (formation: string) => void;
}

const FORMATIONS = [
  { value: '442', label: '4-4-2', df: 4, mf: 4, st: 2 },
  { value: '433', label: '4-3-3', df: 4, mf: 3, st: 3 },
  { value: '451', label: '4-5-1', df: 4, mf: 5, st: 1 },
  { value: '352', label: '3-5-2', df: 3, mf: 5, st: 2 },
  { value: '343', label: '3-4-3', df: 3, mf: 4, st: 3 },
  { value: '532', label: '5-3-2', df: 5, mf: 3, st: 2 },
  { value: '541', label: '5-4-1', df: 5, mf: 4, st: 1 },
];

export default function FormationSelector({ currentFormation, onFormationChange }: FormationSelectorProps) {
  return (
    <div className="formation-selector">
      <label className="formation-label">Formation</label>
      <div className="formation-buttons">
        {FORMATIONS.map(formation => (
          <button
            key={formation.value}
            className={`formation-btn ${currentFormation === formation.value ? 'active' : ''}`}
            onClick={() => onFormationChange(formation.value)}
          >
            {formation.label}
          </button>
        ))}
      </div>

      <style jsx>{`
        .formation-selector {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .formation-label {
          font-size: 0.75rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-weight: 600;
        }

        .formation-buttons {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .formation-btn {
          padding: 0.5rem 0.75rem;
          background: var(--bg-tertiary);
          border: 2px solid var(--border);
          border-radius: var(--radius-sm);
          color: var(--text-secondary);
          font-size: 0.875rem;
          font-weight: 700;
          transition: all var(--transition-base);
          min-width: 60px;
        }

        .formation-btn:hover {
          border-color: var(--primary);
          color: var(--text-primary);
          background: var(--bg-card);
        }

        .formation-btn.active {
          background: var(--primary);
          border-color: var(--primary);
          color: var(--bg-primary);
        }

        @media (max-width: 640px) {
          .formation-btn {
            padding: 0.375rem 0.625rem;
            font-size: 0.8rem;
            min-width: 55px;
          }
        }
      `}</style>
    </div>
  );
}

export { FORMATIONS };