import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { meetingModeLabels, meetingStateLabels } from '../app/labels';
import { StatusMessage } from '../components/StatusMessage';
import { deleteMeeting, getMeetings } from '../services/meetings';
import type { MeetingListItem } from '../types/meetings';
import { formatDate, formatTime } from '../utils/dateTime';

type NavigationState = {
  message?: string;
};

export function MeetingsListPage() {
  const location = useLocation();
  const [meetings, setMeetings] = useState<MeetingListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

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

  const handleDelete = async (meeting: MeetingListItem) => {
    const confirmed = window.confirm(
      `Seguro que quieres eliminar la reunion del ${formatDate(meeting.fecha)} en ${meeting.lugar}? Esta accion no se puede deshacer.`,
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await deleteMeeting(meeting.idReunion);
      setMeetings((current) =>
        current.filter((currentMeeting) => currentMeeting.idReunion !== meeting.idReunion),
      );
      setSuccessMessage(response.message);
      setErrorMessage('');
    } catch (error) {
      setErrorMessage((error as Error).message);
      setSuccessMessage('');
    }
  };

  return (
    <section className="page-section">
      <div className="page-heading">
        <div>
          <h2>Reuniones</h2>
          <p>Controla agenda, participantes y actas de la directiva.</p>
        </div>
        <Link className="button button-primary" to="/reuniones/nueva">
          Crear reunion
        </Link>
      </div>

      {navigationState?.message ? (
        <StatusMessage kind="success" message={navigationState.message} />
      ) : null}

      {successMessage ? (
        <StatusMessage kind="success" message={successMessage} />
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
                  <td data-label="Fecha">{formatDate(meeting.fecha)}</td>
                  <td data-label="Horario">
                    {formatTime(meeting.horaInicio)} - {formatTime(meeting.horaFin)}
                  </td>
                  <td data-label="Lugar">{meeting.lugar}</td>
                  <td data-label="Estado">{meetingStateLabels[meeting.estado]}</td>
                  <td data-label="Modalidad">{meetingModeLabels[meeting.modalidad]}</td>
                  <td data-label="Participantes">{meeting.participantCount}</td>
                  <td data-label="Acta">{meeting.hasActa ? 'Si' : 'No'}</td>
                  <td data-label="Acciones">
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
                      <button
                        className="button button-danger button-small"
                        onClick={() => void handleDelete(meeting)}
                        type="button"
                      >
                        Eliminar
                      </button>
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
