import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../app/useAuth';

export function ProtectedRoute() {
  const location = useLocation();
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <section className="auth-shell">
        <div className="auth-card">
          <h2>Cargando sesion...</h2>
          <p>Estamos verificando tu acceso al sistema.</p>
        </div>
      </section>
    );
  }

  if (!isAuthenticated) {
    return <Navigate replace state={{ from: location }} to="/login" />;
  }

  return <Outlet />;
}
