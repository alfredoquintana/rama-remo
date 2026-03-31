export type MeetingState = 'programada' | 'realizada' | 'cancelada';
export type MeetingMode = 'presencial' | 'online' | 'hibrida';

export type MeetingListItem = {
  idReunion: number;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  lugar: string;
  estado: MeetingState;
  modalidad: MeetingMode;
  participantCount: number;
  hasActa: boolean;
};

export type MeetingParticipant = {
  idUsuario: number;
  nombre: string;
  rut: string;
  telefono: string;
  roles: Array<{
    idRol: number;
    nombre: string;
  }>;
};

export type MeetingDetail = {
  idReunion: number;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  lugar: string;
  estado: MeetingState;
  modalidad: MeetingMode;
  participantIds: number[];
  participantes: MeetingParticipant[];
  hasActa: boolean;
  acta: {
    idActa: number;
    texto: string;
    fechaActualizacion: string;
    actualizadoPor: {
      idUsuario: number;
      nombre: string;
    };
    rol: {
      idRol: number;
      nombre: string;
    };
  } | null;
};

export type MeetingPayload = {
  fecha: string;
  horaInicio: string;
  horaFin: string;
  lugar: string;
  estado: MeetingState;
  modalidad: MeetingMode;
  participantIds: number[];
  acta?: {
    texto: string;
  };
};
