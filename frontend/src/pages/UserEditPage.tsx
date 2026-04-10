import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { StatusMessage } from '../components/StatusMessage';
import { UserForm } from '../components/UserForm';
import { getRoles } from '../services/roles';
import { enableUserAccess, getUser, updateUser } from '../services/users';
import type { Role, UserPayload } from '../types/users';

export function UserEditPage() {
  const navigate = useNavigate();
  const params = useParams();
  const userId = Number(params.id);
  const [roles, setRoles] = useState<Role[]>([]);
  const [hasAccessEnabled, setHasAccessEnabled] = useState(false);
  const [initialValues, setInitialValues] = useState<UserPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEnableAccessModalOpen, setIsEnableAccessModalOpen] = useState(false);
  const [isEnableAccessSubmitting, setIsEnableAccessSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [enableAccessErrorMessage, setEnableAccessErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const enableAccessInitialValues = useMemo(
    () =>
      initialValues
        ? {
            ...initialValues,
            roleIds: [],
          }
        : null,
    [initialValues],
  );

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
        setHasAccessEnabled(userData.accesoHabilitado);
        setErrorMessage('');
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
    setSuccessMessage('');

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

  const handleEnableAccess = async (values: UserPayload) => {
    setIsEnableAccessSubmitting(true);
    setEnableAccessErrorMessage('');
    setSuccessMessage('');

    try {
      const updatedUser = await enableUserAccess(userId, {
        roleIds: values.roleIds,
      });

      setHasAccessEnabled(true);
      setInitialValues((current) =>
        current
          ? {
              ...current,
              roleIds: updatedUser.roleIds,
            }
          : current,
      );
      setIsEnableAccessModalOpen(false);
      setSuccessMessage(
        `Acceso habilitado correctamente. Clave provisoria para ${updatedUser.rut}: ${updatedUser.provisionalPassword}`,
      );
    } catch (error) {
      setEnableAccessErrorMessage((error as Error).message);
    } finally {
      setIsEnableAccessSubmitting(false);
    }
  };

  const openEnableAccessModal = () => {
    setEnableAccessErrorMessage('');
    setSuccessMessage('');
    setIsEnableAccessModalOpen(true);
  };

  const closeEnableAccessModal = () => {
    if (isEnableAccessSubmitting) {
      return;
    }

    setEnableAccessErrorMessage('');
    setIsEnableAccessModalOpen(false);
  };

  return (
    <section className="page-section">
      <div className="page-heading">
        <div>
          <h2>Editar usuario</h2>
          <p>Actualiza los datos personales y, si corresponde, sus roles vigentes.</p>
        </div>
        {!isLoading && initialValues && !hasAccessEnabled ? (
          <button className="button button-secondary" type="button" onClick={openEnableAccessModal}>
            Habilitar acceso al sistema
          </button>
        ) : null}
      </div>

      {successMessage ? <StatusMessage kind="success" message={successMessage} /> : null}

      {isLoading ? (
        <div className="panel-card">
          <p>Cargando usuario...</p>
        </div>
      ) : !initialValues ? (
        <StatusMessage kind="error" message={errorMessage || 'Usuario no encontrado.'} />
      ) : (
        <>
          {!hasAccessEnabled ? (
            <StatusMessage
              kind="error"
              message="Este usuario aún no tiene acceso al sistema. Puedes habilitarlo desde esta misma pantalla."
            />
          ) : null}

          <UserForm
            accessSectionMode={hasAccessEnabled ? 'required' : 'hidden'}
            errorMessage={errorMessage}
            initialValues={initialValues}
            isSubmitting={isSubmitting}
            onSubmit={handleSubmit}
            roles={roles}
            submitLabel="Guardar cambios"
          />
        </>
      )}

      {isEnableAccessModalOpen && enableAccessInitialValues ? (
        <div
          className="user-access-modal-backdrop"
          role="presentation"
          onClick={closeEnableAccessModal}
        >
          <div
            aria-modal="true"
            className="user-access-modal"
            role="dialog"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="user-access-modal__header">
              <div>
                <h3>Habilitar acceso</h3>
                <p className="form-help">
                  Asigna roles y genera la clave provisoria para que este usuario pueda iniciar sesión.
                </p>
              </div>

              <button
                aria-label="Cerrar modal de habilitar acceso"
                className="app-header__account-close"
                type="button"
                onClick={closeEnableAccessModal}
              >
                ×
              </button>
            </div>

            <UserForm
              accessSectionMode="required"
              disablePersonalFields
              errorMessage={enableAccessErrorMessage}
              initialValues={enableAccessInitialValues}
              isSubmitting={isEnableAccessSubmitting}
              onSubmit={handleEnableAccess}
              roles={roles}
              submitLabel="Habilitar acceso"
            />
          </div>
        </div>
      ) : null}
    </section>
  );
}
