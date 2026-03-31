import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { StatusMessage } from '../components/StatusMessage';
import { getMeetings } from '../services/meetings';
import type { MeetingListItem } from '../types/meetings';

type NavigationState = {
  message?: string;
};

export function MeetingsListPage() {
  const location = useLocation();
  const [meetings, setMeetings] = useState<MeetingListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    getMeetings()
      .then((data) => {
        setMeetings(data);
      })
      .catch((error: Error) => {
        setErrorMessage(error.message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const navigationState = (location.state as NavigationState | null) ?? null;

  return (
    <section className="page-section">
      <div className="page-heading">
        <div>
          <h2>Reuniones</h2>
          <p>Control de agenda, participantes y actas de la directiva.</p>
        </div>
        <Link className="button button-primary" to="/reuniones/nueva">
          Crear reunion
        </Link>
      </div>

      {navigationState?.message ? (
        <StatusMessage kind="success" message={navigationState.message} />
      ) : null}

      {errorMessage ? <StatusMessage kind="error" message={errorMessage} /> : null}

      <div className="panel-card">
        {isLoading ? (
          <p>Cargando reuniones...</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Horario</th>
                <th>Lugar</th>
                <th>Estado</th>
                <th>Modalidad</th>
                <th>Participantes</th>
                <th>Acta</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {meetings.map((meeting) => (
                <tr key={meeting.idReunion}>
                  <td>{meeting.fecha}</td>
                  <td>
                    {meeting.horaInicio} - {meeting.horaFin}
                  </td>
                  <td>{meeting.lugar}</td>
                  <td>{meeting.estado}</td>
                  <td>{meeting.modalidad}</td>
                  <td>{meeting.participantCount}</td>
                  <td>{meeting.hasActa ? 'Si' : 'No'}</td>
                  <td>
                    <div className="table-actions">
                      <Link
                        className="button button-secondary button-small"
                        to={`/reuniones/${meeting.idReunion}`}
                      >
                        Ver
                      </Link>
                      <Link
                        className="button button-secondary button-small"
                        to={`/reuniones/${meeting.idReunion}/editar`}
                      >
                        Editar
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
