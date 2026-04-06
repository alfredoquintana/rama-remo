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
        <span className="hero-card__badge">Acceso al sistema</span>
        <h2>Iniciar sesión</h2>
        <p>
          Ingresa con tu RUT y tu clave. Los usuarios nuevos quedan creados con una
          clave provisoria estándar en este entorno de desarrollo.
        </p>

        <label className="form-field">
          <span>RUT</span>
          <input required value={rut} onChange={(event) => setRut(event.target.value)} />
        </label>

        <label className="form-field">
          <span>Contraseña</span>
          <input
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
