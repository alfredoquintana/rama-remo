import { useState, type FormEvent } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../app/useAuth';
import { StatusMessage } from '../components/StatusMessage';

type NavigationState = {
  from?: {
    pathname?: string;
  };
};

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, login } = useAuth();
  const [rut, setRut] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate replace to="/" />;
  }

  const navigationState = (location.state as NavigationState | null) ?? null;
  const nextPath = navigationState?.from?.pathname ?? '/';

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      await login({ rut: rut.trim(), password });
      navigate(nextPath, { replace: true });
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="auth-shell">
      <form className="auth-card" onSubmit={handleSubmit}>
        <div className="auth-card__intro">
          <img alt="Rudern" className="auth-card__logo" src="/rudern-icon.jpeg" />
          <span className="auth-card__eyebrow">Acceso interno</span>
          <h2>Sistema Rama de Remo</h2>
          <p className="auth-card__text">
            Ingresa con tu RUT y clave para gestionar usuarios, reuniones y
            planificación anual.
          </p>
        </div>

        <label className="form-field">
          <span>RUT</span>
          <input
            aria-label="RUT"
            autoComplete="username"
            placeholder="11111111-1"
            required
            value={rut}
            onChange={(event) => setRut(event.target.value)}
          />
        </label>

        <label className="form-field">
          <span>Clave</span>
          <input
            aria-label="Clave"
            autoComplete="current-password"
            placeholder="Tu clave"
            required
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>

        {errorMessage ? <StatusMessage kind="error" message={errorMessage} /> : null}

        <button className="button button-primary" disabled={isSubmitting} type="submit">
          {isSubmitting ? 'Ingresando...' : 'Entrar'}
        </button>

        <p className="auth-card__hint">
          Si estás usando credenciales demo, entra con el RUT y clave entregados para la
          presentación.
        </p>
      </form>
    </section>
  );
}
