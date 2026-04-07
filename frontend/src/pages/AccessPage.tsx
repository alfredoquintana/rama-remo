import { useState, type FormEvent } from 'react';
import { useAuth } from '../app/useAuth';
import { StatusMessage } from '../components/StatusMessage';
import { changePassword } from '../services/auth';

export function AccessPage() {
  const { user } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (newPassword !== confirmPassword) {
      setErrorMessage('La nueva clave y su confirmación deben coincidir.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await changePassword({ newPassword });
      setSuccessMessage(response.message);
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="page-section">
      <div className="page-heading">
        <div>
          <h2>Mi acceso</h2>
          <p>Gestiona tu clave personal y deja listo tu acceso de uso diario.</p>
        </div>
      </div>

      <div className="panel-card">
        <p>
          Usuario actual: <strong>{user?.nombre}</strong> ({user?.rut})
        </p>
        <p className="form-help">
          Puedes mantener la clave provisoria para la demo o definir una nueva cuando lo
          necesites.
        </p>
      </div>

      <form className="form-card" onSubmit={handleSubmit}>
        <div className="form-grid">
          <label className="form-field">
            <span>Nueva clave</span>
            <input
              minLength={6}
              required
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
            />
          </label>

          <label className="form-field">
            <span>Confirmar clave</span>
            <input
              minLength={6}
              required
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
            />
          </label>
        </div>

        {successMessage ? (
          <StatusMessage kind="success" message={successMessage} />
        ) : null}
        {errorMessage ? <StatusMessage kind="error" message={errorMessage} /> : null}

        <div className="form-actions">
          <button className="button button-primary" disabled={isSubmitting} type="submit">
            {isSubmitting ? 'Guardando...' : 'Actualizar clave'}
          </button>
        </div>
      </form>
    </section>
  );
}
