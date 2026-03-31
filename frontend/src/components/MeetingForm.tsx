import { useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import { useAuth } from '../app/useAuth';
import { StatusMessage } from './StatusMessage';
import type { MeetingMode, MeetingPayload, MeetingState } from '../types/meetings';
import type { User } from '../types/users';

type MeetingFormValues = {
  fecha: string;
  horaInicio: string;
  horaFin: string;
  lugar: string;
  estado: MeetingState;
  modalidad: MeetingMode;
  participantIds: number[];
  hasActa: boolean;
  actaTexto: string;
};

type MeetingFormProps = {
  users: User[];
  initialValues: MeetingFormValues;
  submitLabel: string;
  isSubmitting: boolean;
  errorMessage?: string;
  onSubmit: (payload: MeetingPayload) => Promise<void>;
};

const meetingStates: MeetingState[] = ['programada', 'realizada', 'cancelada'];
const meetingModes: MeetingMode[] = ['presencial', 'online', 'hibrida'];

export function MeetingForm({
  users,
  initialValues,
  submitLabel,
  isSubmitting,
  errorMessage,
  onSubmit,
}: MeetingFormProps) {
  const { user } = useAuth();
  const [values, setValues] = useState<MeetingFormValues>(initialValues);
  const [participantQuery, setParticipantQuery] = useState('');
  const [localError, setLocalError] = useState('');

  const currentRoleName = useMemo(() => {
    const roles = [...(user?.roles ?? [])].sort((first, second) => {
      if (first.nombre === 'admin') {
        return -1;
      }

      if (second.nombre === 'admin') {
        return 1;
      }

      return first.nombre.localeCompare(second.nombre);
    });

    return roles[0]?.nombre ?? 'sin rol';
  }, [user?.roles]);

  const selectedParticipants = useMemo(
    () =>
      users.filter((currentUser) =>
        values.participantIds.includes(currentUser.idUsuario),
      ),
    [users, values.participantIds],
  );

  const filteredUsers = useMemo(() => {
    const normalizedQuery = participantQuery.trim().toLowerCase();

    return users.filter((currentUser) => {
      if (values.participantIds.includes(currentUser.idUsuario)) {
        return false;
      }

      if (!normalizedQuery) {
        return false;
      }

      const haystack = [
        currentUser.nombre,
        currentUser.rut,
        currentUser.roles.map((role) => role.nombre).join(' '),
      ]
        .join(' ')
        .toLowerCase();

      return haystack.includes(normalizedQuery);
    });
  }, [participantQuery, users, values.participantIds]);

  const handleChange =
    (
      field: keyof Omit<MeetingFormValues, 'participantIds' | 'hasActa'>,
    ) =>
    (
      event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
    ) => {
      setValues((current) => ({
        ...current,
        [field]: event.target.value,
      }));
    };

  const addParticipant = (userId: number) => {
    setValues((current) => ({
      ...current,
      participantIds: [...current.participantIds, userId],
    }));
    setParticipantQuery('');
  };

  const removeParticipant = (userId: number) => {
    setValues((current) => ({
      ...current,
      participantIds: current.participantIds.filter(
        (currentParticipantId) => currentParticipantId !== userId,
      ),
    }));
  };

  const toggleActa = () => {
    setValues((current) => ({
      ...current,
      hasActa: !current.hasActa,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (values.hasActa && !values.actaTexto.trim()) {
      setLocalError('Si agregas un acta, debes completar su texto.');
      return;
    }

    setLocalError('');

    await onSubmit({
      fecha: values.fecha,
      horaInicio: values.horaInicio,
      horaFin: values.horaFin,
      lugar: values.lugar,
      estado: values.estado,
      modalidad: values.modalidad,
      participantIds: values.participantIds,
      acta: values.hasActa
        ? {
            texto: values.actaTexto,
          }
        : undefined,
    });
  };

  return (
    <form className="form-card" onSubmit={handleSubmit}>
      <div className="form-grid">
        <label className="form-field">
          <span>Fecha</span>
          <input
            required
            type="date"
            value={values.fecha}
            onChange={handleChange('fecha')}
          />
        </label>

        <label className="form-field">
          <span>Hora de inicio</span>
          <input
            required
            type="time"
            value={values.horaInicio}
            onChange={handleChange('horaInicio')}
          />
        </label>

        <label className="form-field">
          <span>Hora de fin</span>
          <input
            required
            type="time"
            value={values.horaFin}
            onChange={handleChange('horaFin')}
          />
        </label>

        <label className="form-field">
          <span>Lugar</span>
          <input
            required
            value={values.lugar}
            onChange={handleChange('lugar')}
          />
        </label>

        <label className="form-field">
          <span>Estado</span>
          <select value={values.estado} onChange={handleChange('estado')}>
            {meetingStates.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </label>

        <label className="form-field">
          <span>Modalidad</span>
          <select value={values.modalidad} onChange={handleChange('modalidad')}>
            {meetingModes.map((mode) => (
              <option key={mode} value={mode}>
                {mode}
              </option>
            ))}
          </select>
        </label>
      </div>

      <fieldset className="form-section">
        <legend>Participantes</legend>

        <label className="form-field">
          <input
            placeholder="Busca por nombre, RUT o rol"
            value={participantQuery}
            onChange={(event) => setParticipantQuery(event.target.value)}
          />
        </label>

        {filteredUsers.length > 0 ? (
          <div className="search-results">
            {filteredUsers.map((participant) => (
              <button
                key={participant.idUsuario}
                className="search-result"
                onClick={() => addParticipant(participant.idUsuario)}
                type="button"
              >
                <strong>{participant.nombre}</strong>
                <span>
                  {participant.rut} ·{' '}
                  {participant.roles.map((role) => role.nombre).join(', ')}
                </span>
              </button>
            ))}
          </div>
        ) : participantQuery.trim() ? (
          <p className="form-help">No hay coincidencias para esa busqueda.</p>
        ) : null}

        <div className="selected-participants">
          {selectedParticipants.length === 0 ? (
            <p className="form-help">Aun no has agregado participantes.</p>
          ) : (
            selectedParticipants.map((participant) => (
              <div key={participant.idUsuario} className="participant-chip">
                <div>
                  <strong>{participant.nombre}</strong>
                  <span>
                    {participant.roles.map((role) => role.nombre).join(', ')}
                  </span>
                </div>
                <button
                  className="button button-secondary button-small"
                  onClick={() => removeParticipant(participant.idUsuario)}
                  type="button"
                >
                  Quitar
                </button>
              </div>
            ))
          )}
        </div>
      </fieldset>

      <fieldset className="form-section">
        <legend>Acta</legend>

        <label className="switch-field">
          <input checked={values.hasActa} onChange={toggleActa} type="checkbox" />
          <span>Agregar o actualizar acta en esta reunion</span>
        </label>

        {values.hasActa ? (
          <div className="form-grid">
            <label className="form-field form-field--full">
              <span>Texto del acta</span>
              <textarea
                required
                rows={8}
                value={values.actaTexto}
                onChange={handleChange('actaTexto')}
              />
            </label>
          </div>
        ) : null}

        {values.hasActa ? (
          <p className="form-help">
            El sistema registrara el acta a nombre de {user?.nombre ?? 'tu usuario'} con el
            rol {currentRoleName}.
          </p>
        ) : null}
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

export type { MeetingFormValues };
