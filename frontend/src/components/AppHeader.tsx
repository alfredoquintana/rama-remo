import { Link } from 'react-router-dom';
import { useAuth } from '../app/useAuth';

export function AppHeader() {
  const { logout, user } = useAuth();

  return (
    <header className="app-header">
      <div className="app-header__content">
        <div>
          <p className="app-header__eyebrow">Administracion</p>
          <div className="app-header__title-row">
            <img
              className="app-header__logo"
              src="/rudern-icon.jpeg"
              alt="Icono Rudern"
            />
            <h1 className="app-header__title">Sistema Rama de Remo - MVP</h1>
          </div>
          <p className="app-header__subtitle">
            Usuarios, roles, reuniones y actas para la directiva.
          </p>
        </div>

        <div className="app-header__session">
          <span className="pill neutral">{user?.nombre ?? 'Sin sesion'}</span>
          <Link className="button button-secondary" to="/mi-acceso">
            Mi acceso
          </Link>
          <button
            className="button button-secondary"
            onClick={logout}
            type="button"
          >
            Cerrar sesion
          </button>
        </div>
      </div>
    </header>
  );
}
