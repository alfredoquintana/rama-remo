import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { StatusMessage } from '../components/StatusMessage';
import { UserForm } from '../components/UserForm';
import { getRoles } from '../services/roles';
import { getUser, updateUser } from '../services/users';
import type { Role, UserPayload } from '../types/users';

export function UserEditPage() {
  const navigate = useNavigate();
  const params = useParams();
  const userId = Number(params.id);
  const [roles, setRoles] = useState<Role[]>([]);
  const [initialValues, setInitialValues] = useState<UserPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

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
          roleIds: userData.roleIds,
        });
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
      await updateUser(userId, values);
      navigate('/usuarios', {
        state: { message: 'Usuario actualizado correctamente.' },
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
          <h2>Editar usuario</h2>
          <p>Actualiza los datos personales y sus roles.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="panel-card">
          <p>Cargando usuario...</p>
        </div>
      ) : !initialValues ? (
        <StatusMessage kind="error" message={errorMessage || 'Usuario no encontrado.'} />
      ) : (
        <UserForm
          errorMessage={errorMessage}
          initialValues={initialValues}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit}
          roles={roles}
          submitLabel="Guardar cambios"
        />
      )}
    </section>
  );
}
