import type { ReactNode } from 'react';

type CompetitionModalProps = {
  title: string;
  description: string;
  children: ReactNode;
  onClose: () => void;
  size?: 'default' | 'wide';
};

export function CompetitionModal({
  title,
  description,
  children,
  onClose,
  size = 'default',
}: CompetitionModalProps) {
  return (
    <div className="competition-modal-backdrop" role="presentation" onClick={onClose}>
      <div
        aria-modal="true"
        className={`competition-modal${size === 'wide' ? ' competition-modal--wide' : ''}`}
        role="dialog"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="competition-modal__header">
          <div>
            <h3>{title}</h3>
            <p className="form-help">{description}</p>
          </div>

          <button
            aria-label="Cerrar gestión de competencia"
            className="app-header__account-close"
            type="button"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}
