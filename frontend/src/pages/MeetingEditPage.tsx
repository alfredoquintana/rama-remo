import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MeetingForm, type MeetingFormValues } from '../components/MeetingForm';
import { StatusMessage } from '../components/StatusMessage';
import { getMeeting, updateMeeting } from '../services/meetings';
import { getUsers } from '../services/users';
import type { MeetingPayload } from '../types/meetings';
import type { User } from '../types/users';

export function MeetingEditPage() {
  const navigate = useNavigate();
  const params = useParams();
  const meetingId = Number(params.id);
  const [users, setUsers] = useState<User[]>([]);
  const [initialValues, setInitialValues] = useState<MeetingFormValues | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    Promise.all([getUsers(), getMeeting(meetingId)])
      .then(([usersData, meetingData]) => {
        setUsers(usersData);
        setInitialValues({
          fecha: meetingData.fecha,
          horaInicio: meetingData.horaInicio.slice(0, 5),
          horaFin: meetingData.horaFin.slice(0, 5),
          lugar: meetingData.lugar,
          estado: meetingData.estado,
          modalidad: meetingData.modalidad,
          participantIds: meetingData.participantIds,
          hasActa: Boolean(meetingData.acta),
          actaTexto: meetingData.acta?.texto ?? '',
        });
      })
      .catch((error: Error) => {
        setErrorMessage(error.message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [meetingId]);

  const handleSubmit = async (values: MeetingPayload) => {
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      await updateMeeting(meetingId, values);
      navigate(`/reuniones/${meetingId}`, {
        state: { message: 'Reunion actualizada correctamente.' },
      });
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="page-section">
      <div className="page-heading">
        <div>
          <h2>Editar reunion</h2>
          <p>Actualiza datos generales, participantes y acta asociada.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="panel-card">
          <p>Cargando reunion...</p>
        </div>
      ) : !initialValues ? (
        <StatusMessage kind="error" message={errorMessage || 'Reunion no encontrada.'} />
      ) : (
        <MeetingForm
          errorMessage={errorMessage}
          initialValues={initialValues}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit}
          submitLabel="Guardar cambios"
          users={users}
        />
      )}
    </section>
  );
}
