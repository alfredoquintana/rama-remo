import { useState, type ChangeEvent, type FormEvent } from 'react';
import { StatusMessage } from './StatusMessage';
import type { Role, UserPayload } from '../types/users';

type UserFormProps = {
  roles: Role[];
  initialValues: UserPayload;
  submitLabel: string;
  isSubmitting: boolean;
  errorMessage?: string;
  onSubmit: (values: UserPayload) => Promise<void>;
};

export function UserForm({
  roles,
  initialValues,
  submitLabel,
  isSubmitting,
  errorMessage,
  onSubmit,
}: UserFormProps) {
  const [values, setValues] = useState<UserPayload>(initialValues);
  const [localError, setLocalError] = useState('');
  const [pendingRoleId, setPendingRoleId] = useState('');

  const selectedRoles = roles.filter((role) => values.roleIds.includes(role.idRol));
  const availableRoles = roles.filter((role) => !values.roleIds.includes(role.idRol));
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

    if (values.roleIds.length === 0) {
      setLocalError('Debes seleccionar al menos un rol.');
      return;
    }

    setLocalError('');
    await onSubmit(values);
  };

  return (
    <form className="form-card" onSubmit={handleSubmit}>
      <div className="form-grid">
        <label className="form-field">
          <span>RUT</span>
          <input required value={values.rut} onChange={handleChange('rut')} />
        </label>

        <label className="form-field">
          <span>Nombre</span>
          <input
            required
            value={values.nombre}
            onChange={handleChange('nombre')}
          />
        </label>

        <label className="form-field">
          <span>Telefono</span>
          <input
            required
            value={values.telefono}
            onChange={handleChange('telefono')}
          />
        </label>

        <label className="form-field">
          <span>Fecha de nacimiento</span>
          <input
            required
            type="date"
            value={values.fechaNac}
            onChange={handleChange('fechaNac')}
          />
        </label>

        <label className="form-field form-field--full">
          <span>Direccion</span>
          <textarea
            required
            rows={3}
            value={values.direccion}
            onChange={handleChange('direccion')}
          />
        </label>
      </div>

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
                    {role.nombre}
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
          <p className="form-help">Aun no has seleccionado roles para este usuario.</p>
        ) : (
          <div className="tag-list">
            {selectedRoles.map((role) => (
              <div key={role.idRol} className="tag-chip">
                <span>{role.nombre}</span>
                <button onClick={() => handleRemoveRole(role.idRol)} type="button">
                  Quitar
                </button>
              </div>
            ))}
          </div>
        )}
      </fieldset>

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
