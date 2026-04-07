import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { meetingModeLabels, meetingStateLabels } from '../app/labels';
import { StatusMessage } from '../components/StatusMessage';
import { deleteMeeting, getMeeting } from '../services/meetings';
import type { MeetingDetail, MeetingMinutesFile } from '../types/meetings';
import { formatDate, formatDateTime, formatTime } from '../utils/dateTime';
import { formatRoleList, toTitleCaseLabel } from '../utils/text';

type NavigationState = {
  message?: string;
};

export function MeetingDetailPage() {
  const navigate = useNavigate();
  const params = useParams();
  const location = useLocation();
  const meetingId = Number(params.id);
  const [meeting, setMeeting] = useState<MeetingDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    getMeeting(meetingId)
      .then((data) => {
        setMeeting(data);
      })
      .catch((error: Error) => {
        setErrorMessage(error.message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [meetingId]);

  const navigationState = (location.state as NavigationState | null) ?? null;

  const handleDelete = async () => {
    if (!meeting) {
      return;
    }

    const confirmed = window.confirm(
      `Seguro que quieres eliminar esta reunión del ${formatDate(meeting.fecha)}? Esta acción no se puede deshacer.`,
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await deleteMeeting(meeting.idReunion);
      navigate('/reuniones', {
        state: { message: response.message },
      });
    } catch (error) {
      setErrorMessage((error as Error).message);
    }
  };

  return (
    <section className="page-section">
      <div className="page-heading">
        <div>
          <h2>Detalle de reunión</h2>
          <p>Revisa participantes, horario y acta asociada.</p>
        </div>
        {meeting ? (
          <div className="table-actions">
            <Link
              className="button button-primary"
              to={`/reuniones/${meeting.idReunion}/editar`}
            >
              Editar reunión
            </Link>
            <button className="button button-danger" onClick={() => void handleDelete()} type="button">
              Eliminar reunión
            </button>
          </div>
        ) : null}
      </div>

      {navigationState?.message ? (
        <StatusMessage kind="success" message={navigationState.message} />
      ) : null}

      {errorMessage ? <StatusMessage kind="error" message={errorMessage} /> : null}

      {isLoading ? (
        <div className="panel-card">
          <p>Cargando detalle...</p>
        </div>
      ) : meeting ? (
        <>
          <div className="content-grid">
            <article className="panel-card">
              <h3>Datos generales</h3>
              <dl className="detail-grid">
                <div>
                  <dt>Fecha</dt>
                  <dd>{formatDate(meeting.fecha)}</dd>
                </div>
                <div>
                  <dt>Horario</dt>
                  <dd>
                    {formatTime(meeting.horaInicio)} - {formatTime(meeting.horaFin)}
                  </dd>
                </div>
                <div>
                  <dt>Lugar</dt>
                  <dd>{meeting.lugar}</dd>
                </div>
                <div>
                  <dt>Estado</dt>
                  <dd>{meetingStateLabels[meeting.estado]}</dd>
                </div>
                <div>
                  <dt>Modalidad</dt>
                  <dd>{meetingModeLabels[meeting.modalidad]}</dd>
                </div>
              </dl>
            </article>

            <article className="panel-card">
              <h3>Participantes</h3>
              {meeting.participantes.length === 0 ? (
                <p>No hay participantes registrados.</p>
              ) : (
                <ul className="list-stack">
                  {meeting.participantes.map((participant) => (
                    <li key={participant.idUsuario}>
                      <strong>{participant.nombre}</strong>
                      <span>{formatRoleList(participant.roles)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </article>
          </div>

          <article className="panel-card">
            <div className="panel-card__header">
              <h3>Acta</h3>
              <span className={`pill ${meeting.hasActa ? 'success' : 'neutral'}`}>
                {meeting.hasActa ? 'Con acta' : 'Sin acta'}
              </span>
            </div>

            {meeting.acta ? (
              <div className="minutes-card">
                <div className="detail-grid">
                  <div>
                    <dt>Título</dt>
                    <dd>{meeting.acta.titulo ?? 'Sin título'}</dd>
                  </div>
                  <div>
                    <dt>Actualizado por</dt>
                    <dd>
                      {meeting.acta.actualizadoPor.nombre} ({toTitleCaseLabel(meeting.acta.rol.nombre)})
                    </dd>
                  </div>
                  <div>
                    <dt>Fecha de actualización</dt>
                    <dd>{formatDateTime(meeting.acta.fechaActualizacion)}</dd>
                  </div>
                </div>

                {meeting.acta.descripcion ? (
                  <p className="minutes-card__text">{meeting.acta.descripcion}</p>
                ) : (
                  <p className="form-help">
                    Esta acta no tiene descripción escrita. Revisa el archivo adjunto si
                    corresponde.
                  </p>
                )}

                {meeting.acta.archivo ? (
                  <div className="file-card">
                    <div className="file-card__meta">
                      <strong>{meeting.acta.archivo.nombre}</strong>
                      <span>
                        {meeting.acta.archivo.tipo || 'application/octet-stream'} -{' '}
                        {formatFileSize(meeting.acta.archivo.tamanoBytes)}
                      </span>
                    </div>
                    <button
                      className="button button-secondary button-small"
                      onClick={() => {
                        if (meeting.acta?.archivo) {
                          downloadActaFile(meeting.acta.archivo);
                        }
                      }}
                      type="button"
                    >
                      Descargar archivo
                    </button>
                  </div>
                ) : null}
              </div>
            ) : (
              <p>Esta reunión aún no tiene acta registrada.</p>
            )}
          </article>
        </>
      ) : null}
    </section>
  );
}

function downloadActaFile(file: MeetingMinutesFile) {
  const binary = window.atob(file.contenidoBase64);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  const blob = new Blob([bytes], {
    type: file.tipo || 'application/octet-stream',
  });
  const url = window.URL.createObjectURL(blob);
  const link = window.document.createElement('a');

  link.href = url;
  link.download = file.nombre;
  link.click();

  window.URL.revokeObjectURL(url);
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
