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

  const handleChange =
    (field: keyof Omit<UserPayload, 'roleIds'>) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setValues((current) => ({
        ...current,
        [field]: event.target.value,
      }));
    };

  const handleRolesChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setValues((current) => ({
      ...current,
      roleIds: Array.from(event.target.selectedOptions, (option) =>
        Number(option.value),
      ),
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
        <label className="form-field">
          <span>Selecciona uno o mas roles</span>
          <select
            multiple
            size={Math.min(roles.length, 8)}
            value={values.roleIds.map(String)}
            onChange={handleRolesChange}
          >
            {roles.map((role) => (
              <option key={role.idRol} value={role.idRol}>
                {role.nombre}
              </option>
            ))}
          </select>
          <small className="form-help">
            Usa Ctrl o Cmd para seleccionar multiples roles.
          </small>
        </label>
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
