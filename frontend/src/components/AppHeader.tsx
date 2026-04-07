import { useEffect, useId, useState, type ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import {
  clearStoredUserPhoto,
  getStoredTheme,
  getStoredUserPhoto,
  setStoredTheme,
  setStoredUserPhoto,
} from '../app/session';
import {
  defaultThemeId,
  isThemeId,
  themeOptions,
  type ThemeId,
} from '../app/theme';
import { useAuth } from '../app/useAuth';

const MAX_PHOTO_SIZE_BYTES = 1024 * 1024;
const MOBILE_NAV_ID = 'app-primary-navigation';

type AppHeaderProps = {
  isMobileNavOpen: boolean;
  onOpenMobileNav: () => void;
};

function MenuIcon() {
  return (
    <svg
      aria-hidden="true"
      className="app-header__icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg
      aria-hidden="true"
      className="app-header__icon app-header__icon--small"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      aria-hidden="true"
      className="app-header__icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 6l12 12" />
      <path d="M18 6 6 18" />
    </svg>
  );
}

function getUserInitials(name?: string) {
  if (!name) {
    return 'SR';
  }

  const words = name
    .split(' ')
    .map((word) => word.trim())
    .filter(Boolean);

  return (
    words
      .slice(0, 2)
      .map((word) => word[0]?.toUpperCase() ?? '')
      .join('') || 'SR'
  );
}

function getInitialTheme() {
  const storedTheme = getStoredTheme();
  return isThemeId(storedTheme) ? storedTheme : defaultThemeId;
}

export function AppHeader({
  isMobileNavOpen,
  onOpenMobileNav,
}: AppHeaderProps) {
  const { logout, user } = useAuth();
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoMessage, setPhotoMessage] = useState('');
  const [photoMessageKind, setPhotoMessageKind] = useState<
    'success' | 'error' | null
  >(null);
  const [themeId, setThemeId] = useState<ThemeId>(getInitialTheme);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const photoInputId = useId();
  const themeSelectId = useId();

  useEffect(() => {
    document.documentElement.dataset.theme = themeId;
    setStoredTheme(themeId);
  }, [themeId]);

  useEffect(() => {
    if (!user) {
      setPhotoUrl(null);
      setPhotoMessage('');
      setPhotoMessageKind(null);
      setIsAccountModalOpen(false);
      return;
    }

    setPhotoUrl(getStoredUserPhoto(user.idUsuario));
    setPhotoMessage('');
    setPhotoMessageKind(null);
  }, [user]);

  useEffect(() => {
    if (!isAccountModalOpen) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsAccountModalOpen(false);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isAccountModalOpen]);

  const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file || !user) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      setPhotoMessage('Selecciona un archivo de imagen valido.');
      setPhotoMessageKind('error');
      event.target.value = '';
      return;
    }

    if (file.size > MAX_PHOTO_SIZE_BYTES) {
      setPhotoMessage('La foto debe pesar hasta 1 MB.');
      setPhotoMessageKind('error');
      event.target.value = '';
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        setPhotoMessage('No se pudo leer la foto seleccionada.');
        setPhotoMessageKind('error');
        return;
      }

      setStoredUserPhoto(user.idUsuario, reader.result);
      setPhotoUrl(reader.result);
      setPhotoMessage('Foto personal actualizada.');
      setPhotoMessageKind('success');
    };

    reader.onerror = () => {
      setPhotoMessage('No se pudo leer la foto seleccionada.');
      setPhotoMessageKind('error');
    };

    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const handleRemovePhoto = () => {
    if (!user) {
      return;
    }

    clearStoredUserPhoto(user.idUsuario);
    setPhotoUrl(null);
    setPhotoMessage('Foto personal eliminada.');
    setPhotoMessageKind('success');
  };

  const handleThemeChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextThemeId = event.target.value;

    if (isThemeId(nextThemeId)) {
      setThemeId(nextThemeId);
    }
  };

  const closeAccountModal = () => {
    setIsAccountModalOpen(false);
  };

  return (
    <>
      <header className="app-header">
        <div className="app-header__content">
          <div className="app-header__brand">
            <button
              aria-controls={MOBILE_NAV_ID}
              aria-expanded={isMobileNavOpen}
              aria-label="Abrir menu principal"
              className="app-header__menu-button"
              type="button"
              onClick={onOpenMobileNav}
            >
              <MenuIcon />
            </button>

            <div className="app-header__title-row">
              <img
                className="app-header__logo"
                src="/rudern-icon.jpeg"
                alt="Icono Rudern"
              />
              <div>
                <h1 className="app-header__title">Sistema Rama de Remo</h1>
                <p className="app-header__subtitle">
                  Usuarios, roles, reuniones y actas para la directiva.
                </p>
              </div>
            </div>
          </div>

          <div className="app-header__session">
            <input
              accept="image/png,image/jpeg,image/webp"
              className="app-header__file-input"
              id={photoInputId}
              type="file"
              onChange={handlePhotoChange}
            />

            <div className="app-header__account">
              <button
                aria-expanded={isAccountModalOpen}
                aria-haspopup="dialog"
                className="app-header__account-trigger"
                type="button"
                onClick={() => setIsAccountModalOpen(true)}
              >
                <span
                  className="app-header__avatar-picker"
                  title={
                    photoUrl
                      ? 'Foto personal configurada'
                      : 'Sin foto personal'
                  }
                >
                  {photoUrl ? (
                    <img
                      className="app-header__avatar-image"
                      src={photoUrl}
                      alt={`Foto personal de ${user?.nombre ?? 'usuario'}`}
                    />
                  ) : (
                    <span className="app-header__avatar-fallback">
                      {getUserInitials(user?.nombre)}
                    </span>
                  )}
                </span>

                <span className="app-header__account-copy">
                  <span className="app-header__account-label">Cuenta</span>
                  <span className="app-header__account-name">
                    {user?.nombre ?? 'Sin sesion'}
                  </span>
                </span>

                <span className="app-header__account-caret">
                  <ChevronDownIcon />
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {isAccountModalOpen ? (
        <div
          className="app-header__account-modal-backdrop"
          role="presentation"
          onClick={closeAccountModal}
        >
          <div
            aria-modal="true"
            className="app-header__account-modal"
            role="dialog"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="app-header__account-modal-top">
              <div className="app-header__account-modal-profile">
                <span className="app-header__avatar-picker app-header__avatar-picker--large">
                  {photoUrl ? (
                    <img
                      className="app-header__avatar-image"
                      src={photoUrl}
                      alt={`Foto personal de ${user?.nombre ?? 'usuario'}`}
                    />
                  ) : (
                    <span className="app-header__avatar-fallback">
                      {getUserInitials(user?.nombre)}
                    </span>
                  )}
                </span>

                <div className="app-header__account-modal-copy">
                  <span className="app-header__account-label">Cuenta</span>
                  <strong>{user?.nombre ?? 'Sin sesion'}</strong>
                  <span>{photoUrl ? 'Foto configurada' : 'Sin foto personal'}</span>
                </div>
              </div>

              <button
                aria-label="Cerrar panel de cuenta"
                className="app-header__account-close"
                type="button"
                onClick={closeAccountModal}
              >
                <CloseIcon />
              </button>
            </div>

            <div className="app-header__theme-picker">
              <label className="app-header__theme-label" htmlFor={themeSelectId}>
                Tema
              </label>
              <select
                className="app-header__theme-select"
                id={themeSelectId}
                value={themeId}
                onChange={handleThemeChange}
              >
                {themeOptions.map((themeOption) => (
                  <option key={themeOption.id} value={themeOption.id}>
                    {themeOption.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="app-header__account-actions app-header__account-actions--stacked">
              <label className="button button-secondary" htmlFor={photoInputId}>
                {photoUrl ? 'Cambiar foto' : 'Configurar foto'}
              </label>
              {photoUrl ? (
                <button
                  className="button button-secondary"
                  type="button"
                  onClick={handleRemovePhoto}
                >
                  Quitar foto
                </button>
              ) : null}
              <Link
                className="button button-secondary"
                to="/mi-acceso"
                onClick={closeAccountModal}
              >
                Mi acceso
              </Link>
              <button className="button button-secondary" type="button" onClick={logout}>
                Cerrar sesion
              </button>
            </div>

            <p
              className={
                photoMessageKind
                  ? `app-header__photo-help is-${photoMessageKind}`
                  : 'app-header__photo-help'
              }
            >
              {photoMessage || 'PNG, JPG o WEBP. Maximo 1 MB.'}
            </p>
          </div>
        </div>
      ) : null}
    </>
  );
}
