import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MeetingForm, type MeetingFormValues } from '../components/MeetingForm';
import { StatusMessage } from '../components/StatusMessage';
import { createMeeting } from '../services/meetings';
import { getUsers } from '../services/users';
import type { User } from '../types/users';
import type { MeetingPayload } from '../types/meetings';

const initialValues: MeetingFormValues = {
  fecha: '',
  horaInicio: '19:00',
  horaFin: '20:30',
  lugar: '',
  estado: 'programada',
  modalidad: 'presencial',
  participantIds: [],
  hasActa: false,
  actaTitulo: '',
  actaDescripcion: '',
  actaArchivo: null,
};

export function MeetingCreatePage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    getUsers()
      .then((usersData) => {
        setUsers(usersData);
      })
      .catch((error: Error) => {
        setErrorMessage(error.message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const handleSubmit = async (values: MeetingPayload) => {
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const meeting = await createMeeting(values);
      navigate(`/reuniones/${meeting.idReunion}`, {
        state: { message: 'Reunión creada correctamente.' },
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
          <h2>Crear reunión</h2>
          <p>Define horario, participantes y acta inicial si corresponde.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="panel-card">
          <p>Cargando datos base...</p>
        </div>
      ) : users.length === 0 ? (
        <StatusMessage
          kind="error"
          message="Necesitas crear usuarios antes de registrar reuniones."
        />
      ) : (
        <MeetingForm
          errorMessage={errorMessage}
          initialValues={initialValues}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit}
          submitLabel="Guardar reunión"
          users={users}
        />
      )}
    </section>
  );
}
