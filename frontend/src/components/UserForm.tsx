import { useState, type ChangeEvent, type FormEvent } from 'react';
import { StatusMessage } from './StatusMessage';
import type { Role, UserPayload } from '../types/users';
import { toTitleCaseLabel } from '../utils/text';

type AccessSectionMode = 'optional' | 'required' | 'hidden';

type UserFormProps = {
  roles: Role[];
  initialValues: UserPayload;
  submitLabel: string;
  isSubmitting: boolean;
  errorMessage?: string;
  accessSectionMode?: AccessSectionMode;
  disablePersonalFields?: boolean;
  onSubmit: (values: UserPayload) => Promise<void>;
};

export function UserForm({
  roles,
  initialValues,
  submitLabel,
  isSubmitting,
  errorMessage,
  accessSectionMode = 'required',
  disablePersonalFields = false,
  onSubmit,
}: UserFormProps) {
  const [values, setValues] = useState<UserPayload>(initialValues);
  const [localError, setLocalError] = useState('');
  const [pendingRoleId, setPendingRoleId] = useState('');
  const [isAccessEnabled, setIsAccessEnabled] = useState(
    accessSectionMode === 'required' ? true : initialValues.roleIds.length > 0,
  );

  const selectedRoles = roles.filter((role) => values.roleIds.includes(role.idRol));
  const availableRoles = roles.filter((role) => !values.roleIds.includes(role.idRol));
  const shouldShowRoles = accessSectionMode !== 'hidden' && isAccessEnabled;
  const currentPendingRoleId =
    pendingRoleId && availableRoles.some((role) => String(role.idRol) === pendingRoleId)
      ? pendingRoleId
      : availableRoles[0]
        ? String(availableRoles[0].idRol)
        : '';

  const handleChange =
    (field: keyof Omit<UserPayload, 'roleIds'>) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setValues((current) => ({
        ...current,
        [field]: event.target.value,
      }));
    };

  const handleRoleSelectChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setPendingRoleId(event.target.value);
  };

  const handleAccessToggle = (event: ChangeEvent<HTMLInputElement>) => {
    setIsAccessEnabled(event.target.checked);
    setLocalError('');
  };

  const handleAddRole = () => {
    const roleId = Number(currentPendingRoleId);

    if (!roleId) {
      return;
    }

    setValues((current) => ({
      ...current,
      roleIds: [...current.roleIds, roleId],
    }));
    setPendingRoleId('');
    setLocalError('');
  };

  const handleRemoveRole = (roleId: number) => {
    setValues((current) => ({
      ...current,
      roleIds: current.roleIds.filter((currentRoleId) => currentRoleId !== roleId),
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (shouldShowRoles && values.roleIds.length === 0) {
      setLocalError('Debes seleccionar al menos un rol.');
      return;
    }

    setLocalError('');
    await onSubmit({
      ...values,
      roleIds: shouldShowRoles ? values.roleIds : [],
    });
  };

  return (
    <form className="form-card" onSubmit={handleSubmit}>
      <div className="form-grid">
        <label className="form-field">
          <span>RUT</span>
          <input
            disabled={disablePersonalFields}
            required
            value={values.rut}
            onChange={handleChange('rut')}
          />
        </label>

        <label className="form-field">
          <span>Nombre</span>
          <input
            disabled={disablePersonalFields}
            required
            value={values.nombre}
            onChange={handleChange('nombre')}
          />
        </label>

        <label className="form-field">
          <span>Teléfono</span>
          <input
            disabled={disablePersonalFields}
            required
            value={values.telefono}
            onChange={handleChange('telefono')}
          />
        </label>

        <label className="form-field">
          <span>Fecha de nacimiento</span>
          <input
            disabled={disablePersonalFields}
            required
            type="date"
            value={values.fechaNac}
            onChange={handleChange('fechaNac')}
          />
        </label>

        <label className="form-field form-field--full">
          <span>Dirección</span>
          <textarea
            disabled={disablePersonalFields}
            required
            rows={3}
            value={values.direccion}
            onChange={handleChange('direccion')}
          />
        </label>
      </div>

      {accessSectionMode === 'optional' ? (
        <label className="switch-field">
          <input checked={isAccessEnabled} type="checkbox" onChange={handleAccessToggle} />
          <span>Habilitar acceso al sistema de inmediato</span>
        </label>
      ) : null}

      {accessSectionMode === 'hidden' ? (
        <p className="form-help">
          Este usuario sigue registrado sin acceso. Si necesitas que inicie sesión,
          usa la opción habilitar acceso.
        </p>
      ) : null}

      {shouldShowRoles ? (
        <fieldset className="form-section">
          <legend>Roles</legend>
          <div className="selection-row">
            <label className="form-field">
              <span>Selecciona un rol</span>
              <select
                disabled={availableRoles.length === 0}
                value={currentPendingRoleId}
                onChange={handleRoleSelectChange}
              >
                {availableRoles.length === 0 ? (
                  <option value="">No quedan roles por agregar</option>
                ) : (
                  availableRoles.map((role) => (
                    <option key={role.idRol} value={role.idRol}>
                      {toTitleCaseLabel(role.nombre)}
                    </option>
                  ))
                )}
              </select>
            </label>

            <button
              className="button button-secondary"
              disabled={availableRoles.length === 0}
              onClick={handleAddRole}
              type="button"
            >
              Agregar rol
            </button>
          </div>

          {selectedRoles.length === 0 ? (
            <p className="form-help">Aún no has seleccionado roles para este usuario.</p>
          ) : (
            <div className="tag-list">
              {selectedRoles.map((role) => (
                <div key={role.idRol} className="tag-chip">
                  <span>{toTitleCaseLabel(role.nombre)}</span>
                  <button onClick={() => handleRemoveRole(role.idRol)} type="button">
                    Quitar
                  </button>
                </div>
              ))}
            </div>
          )}
        </fieldset>
      ) : (
        <p className="form-help">
          El usuario quedará registrado como persona del club, pero sin acceso al sistema.
        </p>
      )}

      {localError ? <StatusMessage kind="error" message={localError} /> : null}
      {errorMessage ? <StatusMessage kind="error" message={errorMessage} /> : null}

      <div className="form-actions">
        <button className="button button-primary" disabled={isSubmitting} type="submit">
          {isSubmitting ? 'Guardando...' : submitLabel}
        </button>
      </div>
    </form>
  );
}
