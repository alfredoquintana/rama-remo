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
      await login({ rut, password });
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
          <h2>Iniciar sesion</h2>
        </div>

        <label className="form-field">
          <input
            aria-label="RUT"
            autoComplete="username"
            placeholder="RUT"
            required
            value={rut}
            onChange={(event) => setRut(event.target.value)}
          />
        </label>

        <label className="form-field">
          <input
            aria-label="Contrasena"
            autoComplete="current-password"
            placeholder="Contrasena"
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
      </form>
    </section>
  );
}
