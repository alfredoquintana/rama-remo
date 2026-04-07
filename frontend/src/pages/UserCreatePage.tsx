import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StatusMessage } from '../components/StatusMessage';
import { UserForm } from '../components/UserForm';
import { getRoles } from '../services/roles';
import { createUser } from '../services/users';
import type { Role, UserPayload } from '../types/users';

const initialValues: UserPayload = {
  rut: '',
  nombre: '',
  telefono: '',
  fechaNac: '',
  direccion: '',
  roleIds: [],
};

export function UserCreatePage() {
  const navigate = useNavigate();
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    getRoles()
      .then((data) => {
        setRoles(data);
      })
      .catch((error: Error) => {
        setErrorMessage(error.message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const handleSubmit = async (values: UserPayload) => {
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const createdUser = await createUser(values);
      const message = createdUser.provisionalPassword
        ? `Usuario creado correctamente. Clave provisoria para ${createdUser.rut}: ${createdUser.provisionalPassword}`
        : 'Usuario creado correctamente sin acceso al sistema.';

      navigate('/usuarios', {
        state: {
          message,
        },
      });
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
          <h2>Crear usuario</h2>
          <p>Registra una nueva persona y decide si tendrá acceso al sistema.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="panel-card">
          <p>Cargando roles...</p>
        </div>
      ) : roles.length === 0 ? (
        <StatusMessage
          kind="error"
          message="No hay roles disponibles. Verifica el seed inicial del backend."
        />
      ) : (
        <UserForm
          accessSectionMode="optional"
          errorMessage={errorMessage}
          initialValues={initialValues}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit}
          roles={roles}
          submitLabel="Guardar usuario"
        />
      )}
    </section>
  );
}
