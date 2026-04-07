import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { StatusMessage } from '../components/StatusMessage';
import { UserForm } from '../components/UserForm';
import { getRoles } from '../services/roles';
import { enableUserAccess, getUser } from '../services/users';
import type { Role, UserPayload } from '../types/users';

export function UserEnableAccessPage() {
  const navigate = useNavigate();
  const params = useParams();
  const userId = Number(params.id);
  const [roles, setRoles] = useState<Role[]>([]);
  const [initialValues, setInitialValues] = useState<UserPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [alreadyEnabled, setAlreadyEnabled] = useState(false);

  useEffect(() => {
    Promise.all([getRoles(), getUser(userId)])
      .then(([rolesData, userData]) => {
        setRoles(rolesData);
        setInitialValues({
          rut: userData.rut,
          nombre: userData.nombre,
          telefono: userData.telefono,
          fechaNac: userData.fechaNac,
          direccion: userData.direccion,
          roleIds: [],
        });
        setAlreadyEnabled(userData.accesoHabilitado);
      })
      .catch((error: Error) => {
        setErrorMessage(error.message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [userId]);

  const handleSubmit = async (values: UserPayload) => {
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const updatedUser = await enableUserAccess(userId, {
        roleIds: values.roleIds,
      });
      navigate('/usuarios', {
        state: {
          message: `Acceso habilitado correctamente. Clave provisoria para ${updatedUser.rut}: ${updatedUser.provisionalPassword}`,
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
          <h2>Habilitar acceso</h2>
          <p>Asigna roles y genera la clave provisoria para un usuario existente.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="panel-card">
          <p>Cargando usuario...</p>
        </div>
      ) : !initialValues ? (
        <StatusMessage kind="error" message={errorMessage || 'Usuario no encontrado.'} />
      ) : alreadyEnabled ? (
        <StatusMessage
          kind="error"
          message="Este usuario ya tiene acceso habilitado. Usa editar usuario para ajustar sus roles."
        />
      ) : (
        <UserForm
          accessSectionMode="required"
          disablePersonalFields
          errorMessage={errorMessage}
          initialValues={initialValues}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit}
          roles={roles}
          submitLabel="Habilitar acceso"
        />
      )}
    </section>
  );
}
