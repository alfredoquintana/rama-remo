import { useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import { meetingModeLabels, meetingStateLabels } from '../app/labels';
import { useAuth } from '../app/useAuth';
import { StatusMessage } from './StatusMessage';
import type {
  MeetingMinutesFile,
  MeetingMode,
  MeetingPayload,
  MeetingState,
} from '../types/meetings';
import type { User } from '../types/users';
import { formatRoleList, toTitleCaseLabel } from '../utils/text';

const MAX_ACTA_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const ACTA_FILE_ACCEPT =
  '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.rtf,.csv,.odt,.ods,.odp,.jpg,.jpeg,.png,.webp';

type MeetingFormValues = {
  fecha: string;
  horaInicio: string;
  horaFin: string;
  lugar: string;
  estado: MeetingState;
  modalidad: MeetingMode;
  participantIds: number[];
  hasActa: boolean;
  actaTitulo: string;
  actaDescripcion: string;
  actaArchivo: MeetingMinutesFile | null;
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
  const [isReadingFile, setIsReadingFile] = useState(false);
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

    return toTitleCaseLabel(roles[0]?.nombre ?? 'sin rol');
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
      field: keyof Omit<MeetingFormValues, 'participantIds' | 'hasActa' | 'actaArchivo'>,
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
    setLocalError('');
  };

  const handleActaFileChange = async (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const input = event.target;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    if (file.size > MAX_ACTA_FILE_SIZE_BYTES) {
      setLocalError('El archivo del acta no puede superar los 5 MB.');
      input.value = '';
      return;
    }

    try {
      setIsReadingFile(true);
      const contenidoBase64 = await readFileAsBase64(file);

      setValues((current) => ({
        ...current,
        actaArchivo: {
          nombre: file.name,
          tipo: file.type || 'application/octet-stream',
          contenidoBase64,
          tamanoBytes: file.size,
        },
      }));
      setLocalError('');
    } catch {
      setLocalError('No fue posible leer el archivo seleccionado.');
    } finally {
      setIsReadingFile(false);
      input.value = '';
    }
  };

  const removeActaFile = () => {
    setValues((current) => ({
      ...current,
      actaArchivo: null,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const fecha = values.fecha.trim();
    const horaInicio = values.horaInicio.trim();
    const horaFin = values.horaFin.trim();
    const lugar = values.lugar.trim();

    if (isReadingFile) {
      setLocalError('Espera a que termine de cargarse el archivo del acta.');
      return;
    }

    if (!fecha) {
      setLocalError('Debes indicar la fecha de la reunión.');
      return;
    }

    if (!horaInicio) {
      setLocalError('Debes indicar la hora de inicio.');
      return;
    }

    if (!horaFin) {
      setLocalError('Debes indicar la hora de término.');
      return;
    }

    if (horaFin <= horaInicio) {
      setLocalError('La hora de término debe ser posterior a la hora de inicio.');
      return;
    }

    if (!lugar) {
      setLocalError('Debes indicar el lugar o medio de la reunión.');
      return;
    }

    if (values.hasActa) {
      const descripcion = values.actaDescripcion.trim();

      if (!descripcion && !values.actaArchivo) {
        setLocalError(
          'Si agregas un acta, debes escribir una descripción o adjuntar un archivo.',
        );
        return;
      }
    }

    setLocalError('');

    await onSubmit({
      fecha,
      horaInicio,
      horaFin,
      lugar,
      estado: values.estado,
      modalidad: values.modalidad,
      participantIds: values.participantIds,
      acta: values.hasActa
        ? {
            titulo: values.actaTitulo.trim() || undefined,
            descripcion: values.actaDescripcion.trim() || undefined,
            archivo: values.actaArchivo ?? undefined,
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
          <span>Hora de término</span>
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
                {meetingStateLabels[state]}
              </option>
            ))}
          </select>
        </label>

        <label className="form-field">
          <span>Modalidad</span>
          <select value={values.modalidad} onChange={handleChange('modalidad')}>
            {meetingModes.map((mode) => (
              <option key={mode} value={mode}>
                {meetingModeLabels[mode]}
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
                  {participant.rut} - {formatRoleList(participant.roles)}
                </span>
              </button>
            ))}
          </div>
        ) : participantQuery.trim() ? (
          <p className="form-help">No hay coincidencias para esa búsqueda.</p>
        ) : null}

        <div className="selected-participants">
          {selectedParticipants.length === 0 ? (
            <p className="form-help">Aún no has agregado participantes.</p>
          ) : (
            selectedParticipants.map((participant) => (
              <div key={participant.idUsuario} className="participant-chip">
                <div>
                  <strong>{participant.nombre}</strong>
                  <span>{formatRoleList(participant.roles)}</span>
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
          <span>Agregar o actualizar acta en esta reunión</span>
        </label>

        {values.hasActa ? (
          <div className="form-grid">
            <label className="form-field form-field--full">
              <span>Título del acta</span>
              <input
                placeholder="Ej: Reunión ordinaria de directiva"
                value={values.actaTitulo}
                onChange={handleChange('actaTitulo')}
              />
            </label>

            <label className="form-field form-field--full">
              <span>Descripción o resumen</span>
              <textarea
                rows={6}
                value={values.actaDescripcion}
                onChange={handleChange('actaDescripcion')}
              />
            </label>

            <label className="form-field form-field--full">
              <span>Archivo del acta</span>
              <input accept={ACTA_FILE_ACCEPT} onChange={handleActaFileChange} type="file" />
              <small className="form-help">
                Puedes adjuntar PDF, Word, Excel, PowerPoint, texto o imágenes de
                hasta 5 MB.
              </small>
            </label>

            {values.actaArchivo ? (
              <div className="file-card form-field--full">
                <div className="file-card__meta">
                  <strong>{values.actaArchivo.nombre}</strong>
                  <span>
                    {values.actaArchivo.tipo || 'application/octet-stream'} -{' '}
                    {formatFileSize(values.actaArchivo.tamanoBytes)}
                  </span>
                </div>
                <button
                  className="button button-secondary button-small"
                  onClick={removeActaFile}
                  type="button"
                >
                  Quitar archivo
                </button>
              </div>
            ) : null}
          </div>
        ) : null}

        {values.hasActa ? (
          <p className="form-help">
            El sistema registrará el acta a nombre de {user?.nombre ?? 'tu usuario'} con el
            rol {currentRoleName}. Puedes guardar una descripción corta, un archivo o ambos.
          </p>
        ) : null}
      </fieldset>

      {localError ? <StatusMessage kind="error" message={localError} /> : null}
      {errorMessage ? <StatusMessage kind="error" message={errorMessage} /> : null}

      <div className="form-actions">
        <button
          className="button button-primary"
          disabled={isSubmitting || isReadingFile}
          type="submit"
        >
          {isSubmitting || isReadingFile ? 'Guardando...' : submitLabel}
        </button>
      </div>
    </form>
  );
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function readFileAsBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        reject(new Error('Unexpected file reader result.'));
        return;
      }

      const [, contenidoBase64 = ''] = reader.result.split(',', 2);
      resolve(contenidoBase64);
    };

    reader.onerror = () => {
      reject(reader.error ?? new Error('File read failed.'));
    };

    reader.readAsDataURL(file);
  });
}

export type { MeetingFormValues };
