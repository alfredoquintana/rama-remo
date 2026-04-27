import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import {
  ActaEntity,
  ParticipanteReunionEntity,
  ReunionEntity,
  UsuarioEntity,
} from '../../database/entities';
import { normalizeLabelText } from '../../common/text.util';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { UpdateMeetingDto } from './dto/update-meeting.dto';
import { MeetingsMinutesService } from './meetings-minutes.service';

@Injectable()
export class MeetingsService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly meetingsMinutesService: MeetingsMinutesService,
    @InjectRepository(ReunionEntity)
    private readonly meetingsRepository: Repository<ReunionEntity>,
    @InjectRepository(ParticipanteReunionEntity)
    private readonly participantsRepository: Repository<ParticipanteReunionEntity>,
    @InjectRepository(UsuarioEntity)
    private readonly usersRepository: Repository<UsuarioEntity>,
  ) {}

  async findAll() {
    const meetings = await this.meetingsRepository.find({
      relations: {
        participantes: true,
        acta: true,
      },
      order: {
        fecha: 'DESC',
        horaInicio: 'DESC',
      },
    });

    return meetings.map((meeting) => ({
      idReunion: meeting.idReunion,
      fecha: meeting.fecha,
      horaInicio: meeting.horaInicio,
      horaFin: meeting.horaFin,
      lugar: meeting.lugar,
      estado: meeting.estado,
      modalidad: meeting.modalidad,
      participantCount: meeting.participantes?.length ?? 0,
      hasActa: Boolean(meeting.acta),
    }));
  }

  async findOne(id: number) {
    const meeting = await this.meetingsRepository.findOne({
      where: { idReunion: id },
      relations: {
        participantes: {
          usuario: {
            usuarioRoles: {
              rol: true,
            },
          },
        },
        acta: {
          actualizadoPor: {
            usuarioRoles: {
              rol: true,
            },
          },
          rol: true,
        },
      },
    });

    if (!meeting) {
      throw new NotFoundException('ReuniÃ³n no encontrada.');
    }

    return this.mapMeetingDetail(meeting);
  }

  async create(createMeetingDto: CreateMeetingDto, actorUserId: number) {
    const lugar = this.normalizeMeetingPlace(createMeetingDto.lugar);

    this.validateMeetingTimes(
      createMeetingDto.horaInicio,
      createMeetingDto.horaFin,
    );
    this.ensureMeetingPlaceIsValid(lugar);

    const participantIds = this.uniqueIds(
      createMeetingDto.participantIds ?? [],
    );
    await this.ensureUsersExist(participantIds);

    if (createMeetingDto.acta) {
      await this.meetingsMinutesService.ensureActaDataIsValid(
        actorUserId,
        createMeetingDto.acta,
      );
    }

    const meetingId = await this.dataSource.transaction(async (manager) => {
      const meetingRepository = manager.getRepository(ReunionEntity);
      const participantRepository = manager.getRepository(
        ParticipanteReunionEntity,
      );
      const minutesRepository = manager.getRepository(ActaEntity);

      const meeting = await meetingRepository.save(
        meetingRepository.create({
          fecha: createMeetingDto.fecha,
          horaInicio: createMeetingDto.horaInicio,
          horaFin: createMeetingDto.horaFin,
          lugar,
          estado: createMeetingDto.estado,
          modalidad: createMeetingDto.modalidad,
        }),
      );

      await this.replaceParticipants(
        participantRepository,
        meeting.idReunion,
        participantIds,
      );

      if (createMeetingDto.acta) {
        await this.meetingsMinutesService.upsertActa(
          minutesRepository,
          meeting.idReunion,
          createMeetingDto.acta,
          actorUserId,
        );
      }

      return meeting.idReunion;
    });

    return this.findOne(meetingId);
  }

  async update(
    id: number,
    updateMeetingDto: UpdateMeetingDto,
    actorUserId: number,
  ) {
    const currentMeeting = await this.meetingsRepository.findOne({
      where: { idReunion: id },
    });

    if (!currentMeeting) {
      throw new NotFoundException('ReuniÃ³n no encontrada.');
    }

    const nextHoraInicio =
      updateMeetingDto.horaInicio ?? currentMeeting.horaInicio;
    const nextHoraFin = updateMeetingDto.horaFin ?? currentMeeting.horaFin;
    const nextLugar =
      updateMeetingDto.lugar !== undefined
        ? this.normalizeMeetingPlace(updateMeetingDto.lugar)
        : currentMeeting.lugar;

    this.validateMeetingTimes(nextHoraInicio, nextHoraFin);
    this.ensureMeetingPlaceIsValid(nextLugar);

    const participantIds =
      updateMeetingDto.participantIds !== undefined
        ? this.uniqueIds(updateMeetingDto.participantIds)
        : null;

    if (participantIds) {
      await this.ensureUsersExist(participantIds);
    }

    if (updateMeetingDto.acta) {
      await this.meetingsMinutesService.ensureActaDataIsValid(
        actorUserId,
        updateMeetingDto.acta,
      );
    }

    await this.dataSource.transaction(async (manager) => {
      const meetingRepository = manager.getRepository(ReunionEntity);
      const participantRepository = manager.getRepository(
        ParticipanteReunionEntity,
      );
      const minutesRepository = manager.getRepository(ActaEntity);

      await meetingRepository.save(
        meetingRepository.create({
          ...currentMeeting,
          fecha: updateMeetingDto.fecha ?? currentMeeting.fecha,
          horaInicio: nextHoraInicio,
          horaFin: nextHoraFin,
          lugar: nextLugar,
          estado: updateMeetingDto.estado ?? currentMeeting.estado,
          modalidad: updateMeetingDto.modalidad ?? currentMeeting.modalidad,
        }),
      );

      if (participantIds) {
        await this.replaceParticipants(
          participantRepository,
          id,
          participantIds,
        );
      }

      if (updateMeetingDto.acta) {
        await this.meetingsMinutesService.upsertActa(
          minutesRepository,
          id,
          updateMeetingDto.acta,
          actorUserId,
        );
      }
    });

    return this.findOne(id);
  }

  async delete(id: number) {
    const currentMeeting = await this.meetingsRepository.findOne({
      where: { idReunion: id },
      relations: {
        acta: true,
      },
    });

    if (!currentMeeting) {
      throw new NotFoundException('ReuniÃ³n no encontrada.');
    }

    await this.meetingsMinutesService.deleteActaFile(currentMeeting.acta);
    await this.meetingsRepository.delete({ idReunion: id });

    return {
      message: 'ReuniÃ³n eliminada correctamente.',
    };
  }

  private uniqueIds(ids: number[]) {
    return [...new Set(ids)];
  }

  private normalizeMeetingPlace(value: string) {
    return normalizeLabelText(value);
  }

  private ensureMeetingPlaceIsValid(lugar: string) {
    if (!lugar) {
      throw new BadRequestException(
        'Debes indicar el lugar o medio donde se realizarÃ¡ la reuniÃ³n.',
      );
    }
  }

  private async ensureUsersExist(userIds: number[]) {
    if (userIds.length === 0) {
      return;
    }

    const users = await this.usersRepository.findBy({
      idUsuario: In(userIds),
    });

    if (users.length !== userIds.length) {
      throw new NotFoundException('Uno o mas participantes no existen.');
    }
  }

  private validateMeetingTimes(horaInicio: string, horaFin: string) {
    if (horaFin <= horaInicio) {
      throw new BadRequestException(
        'La hora de tÃ©rmino debe ser posterior a la hora de inicio.',
      );
    }
  }

  private async replaceParticipants(
    participantRepository: Repository<ParticipanteReunionEntity>,
    meetingId: number,
    participantIds: number[],
  ) {
    await participantRepository.delete({ idReunion: meetingId });

    if (participantIds.length === 0) {
      return;
    }

    await participantRepository.save(
      participantIds.map((idUsuario) =>
        participantRepository.create({
          idReunion: meetingId,
          idUsuario,
        }),
      ),
    );
  }

  private async mapMeetingDetail(meeting: ReunionEntity) {
    const participantes = [...(meeting.participantes ?? [])]
      .map((participant) => participant.usuario)
      .sort((first, second) => first.nombre.localeCompare(second.nombre))
      .map((usuario) => ({
        idUsuario: usuario.idUsuario,
        nombre: usuario.nombre,
        rut: usuario.rut,
        telefono: usuario.telefono,
        roles: [...(usuario.usuarioRoles ?? [])]
          .map((userRole) => ({
            idRol: userRole.rol.idRol,
            nombre: userRole.rol.nombre,
          }))
          .sort((first, second) => first.nombre.localeCompare(second.nombre)),
      }));

    return {
      idReunion: meeting.idReunion,
      fecha: meeting.fecha,
      horaInicio: meeting.horaInicio,
      horaFin: meeting.horaFin,
      lugar: meeting.lugar,
      estado: meeting.estado,
      modalidad: meeting.modalidad,
      participantIds: participantes.map((participant) => participant.idUsuario),
      participantes,
      hasActa: Boolean(meeting.acta),
      acta: await this.meetingsMinutesService.mapActa(meeting.acta),
    };
  }
}
