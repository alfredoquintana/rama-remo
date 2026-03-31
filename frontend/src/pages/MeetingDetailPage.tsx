import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { StatusMessage } from '../components/StatusMessage';
import { getMeeting } from '../services/meetings';
import type { MeetingDetail } from '../types/meetings';

type NavigationState = {
  message?: string;
};

export function MeetingDetailPage() {
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

  return (
    <section className="page-section">
      <div className="page-heading">
        <div>
          <h2>Detalle de reunion</h2>
          <p>Vista completa de participantes y acta asociada.</p>
        </div>
        {meeting ? (
          <Link
            className="button button-primary"
            to={`/reuniones/${meeting.idReunion}/editar`}
          >
            Editar reunion
          </Link>
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
                  <dd>{meeting.fecha}</dd>
                </div>
                <div>
                  <dt>Horario</dt>
                  <dd>
                    {meeting.horaInicio} - {meeting.horaFin}
                  </dd>
                </div>
                <div>
                  <dt>Lugar</dt>
                  <dd>{meeting.lugar}</dd>
                </div>
                <div>
                  <dt>Estado</dt>
                  <dd>{meeting.estado}</dd>
                </div>
                <div>
                  <dt>Modalidad</dt>
                  <dd>{meeting.modalidad}</dd>
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
                      <span>{participant.roles.map((role) => role.nombre).join(', ')}</span>
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
                    <dt>Actualizado por</dt>
                    <dd>
                      {meeting.acta.actualizadoPor.nombre} ({meeting.acta.rol.nombre})
                    </dd>
                  </div>
                  <div>
                    <dt>Fecha de actualizacion</dt>
                    <dd>
                      {new Date(meeting.acta.fechaActualizacion).toLocaleString()}
                    </dd>
                  </div>
                </div>
                <p className="minutes-card__text">{meeting.acta.texto}</p>
              </div>
            ) : (
              <p>Esta reunion aun no tiene acta registrada.</p>
            )}
          </article>
        </>
      ) : null}
    </section>
  );
}
