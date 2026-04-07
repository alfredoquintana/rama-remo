import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, QueryFailedError, Repository } from 'typeorm';
import {
  EstadoPlanItem,
  PlanAnualEntity,
  PlanAreaEntity,
  PlanItemEntity,
  PlanSeguimientoEntity,
  UsuarioEntity,
} from '../../database/entities';
import { CreatePlanFollowupDto } from './dto/create-plan-followup.dto';
import { CreatePlanItemDto } from './dto/create-plan-item.dto';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanItemDto } from './dto/update-plan-item.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';

const FINAL_PLAN_ITEM_STATES = new Set<EstadoPlanItem>([
  EstadoPlanItem.CUMPLIDO,
  EstadoPlanItem.PARCIALMENTE_CUMPLIDO,
  EstadoPlanItem.NO_CUMPLIDO,
  EstadoPlanItem.CANCELADO,
]);

@Injectable()
export class PlanningService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(PlanAnualEntity)
    private readonly annualPlansRepository: Repository<PlanAnualEntity>,
    @InjectRepository(PlanAreaEntity)
    private readonly planAreasRepository: Repository<PlanAreaEntity>,
    @InjectRepository(PlanItemEntity)
    private readonly planItemsRepository: Repository<PlanItemEntity>,
    @InjectRepository(PlanSeguimientoEntity)
    private readonly planFollowupsRepository: Repository<PlanSeguimientoEntity>,
    @InjectRepository(UsuarioEntity)
    private readonly usersRepository: Repository<UsuarioEntity>,
  ) {}

  async findAll() {
    const plans = await this.annualPlansRepository.find({
      relations: {
        items: true,
      },
      order: {
        anio: 'DESC',
        nombre: 'ASC',
      },
    });

    return plans.map((plan) => ({
      idPlanAnual: plan.idPlanAnual,
      anio: plan.anio,
      nombre: plan.nombre,
      estado: plan.estado,
      objetivoGeneral: plan.objetivoGeneral,
      summary: this.buildSummary(plan.items ?? []),
    }));
  }

  async findOne(id: number) {
    const plan = await this.annualPlansRepository.findOne({
      where: { idPlanAnual: id },
      relations: {
        areas: {
          items: true,
        },
        items: {
          area: true,
          responsable: true,
          seguimientos: {
            registradoPor: true,
          },
        },
      },
      order: {
        areas: {
          orden: 'ASC',
          nombre: 'ASC',
        },
        items: {
          fechaPlanificada: 'ASC',
          titulo: 'ASC',
          seguimientos: {
            fechaSeguimiento: 'DESC',
          },
        },
      },
    });

    if (!plan) {
      throw new NotFoundException('Plan anual no encontrado.');
    }

    return this.mapPlanDetail(plan);
  }

  async create(createPlanDto: CreatePlanDto) {
    const normalizedAreas = this.normalizeAreas(createPlanDto.areas);

    try {
      const planId = await this.dataSource.transaction(async (manager) => {
        const annualPlansRepository = manager.getRepository(PlanAnualEntity);
        const planAreasRepository = manager.getRepository(PlanAreaEntity);

        const plan = await annualPlansRepository.save(
          annualPlansRepository.create({
            anio: createPlanDto.anio,
            nombre: createPlanDto.nombre.trim(),
            estado: createPlanDto.estado,
            objetivoGeneral: createPlanDto.objetivoGeneral?.trim() || null,
          }),
        );

        await planAreasRepository.save(
          normalizedAreas.map((area) =>
            planAreasRepository.create({
              idPlanAnual: plan.idPlanAnual,
              nombre: area.nombre,
              descripcion: area.descripcion,
              orden: area.orden,
            }),
          ),
        );

        return plan.idPlanAnual;
      });

      return this.findOne(planId);
    } catch (error) {
      this.handleDuplicatePlan(error);
    }
  }

  async update(id: number, updatePlanDto: UpdatePlanDto) {
    const currentPlan = await this.annualPlansRepository.findOne({
      where: { idPlanAnual: id },
    });

    if (!currentPlan) {
      throw new NotFoundException('Plan anual no encontrado.');
    }

    const normalizedAreas = updatePlanDto.areas
      ? this.normalizeAreas(updatePlanDto.areas)
      : null;

    try {
      await this.dataSource.transaction(async (manager) => {
        const annualPlansRepository = manager.getRepository(PlanAnualEntity);
        const planAreasRepository = manager.getRepository(PlanAreaEntity);

        await annualPlansRepository.save(
          annualPlansRepository.create({
            ...currentPlan,
            anio: updatePlanDto.anio ?? currentPlan.anio,
            nombre: updatePlanDto.nombre?.trim() ?? currentPlan.nombre,
            estado: updatePlanDto.estado ?? currentPlan.estado,
            objetivoGeneral:
              updatePlanDto.objetivoGeneral !== undefined
                ? updatePlanDto.objetivoGeneral.trim() || null
                : currentPlan.objetivoGeneral,
          }),
        );

        if (normalizedAreas) {
          await this.syncPlanAreas(planAreasRepository, id, normalizedAreas);
        }
      });

      return this.findOne(id);
    } catch (error) {
      this.handleDuplicatePlan(error);
    }
  }

  async delete(id: number) {
    const currentPlan = await this.annualPlansRepository.findOneBy({
      idPlanAnual: id,
    });

    if (!currentPlan) {
      throw new NotFoundException('Plan anual no encontrado.');
    }

    await this.annualPlansRepository.delete({ idPlanAnual: id });

    return {
      message: 'Plan anual eliminado correctamente.',
    };
  }

  async createItem(planId: number, createPlanItemDto: CreatePlanItemDto) {
    await this.ensurePlanExists(planId);
    await this.ensureAreaBelongsToPlan(planId, createPlanItemDto.idAreaPlan);
    await this.ensureUserExistsIfNeeded(createPlanItemDto.idResponsable);

    const item = await this.planItemsRepository.save(
      this.planItemsRepository.create({
        idPlanAnual: planId,
        idAreaPlan: createPlanItemDto.idAreaPlan,
        idResponsable: createPlanItemDto.idResponsable ?? null,
        titulo: createPlanItemDto.titulo.trim(),
        descripcion: createPlanItemDto.descripcion.trim(),
        resultadoEsperado: createPlanItemDto.resultadoEsperado.trim(),
        prioridad: createPlanItemDto.prioridad,
        estado: createPlanItemDto.estado,
        fechaPlanificada: createPlanItemDto.fechaPlanificada,
        fechaCumplimientoReal:
          createPlanItemDto.fechaCumplimientoReal ??
          this.resolveCompletionDate(createPlanItemDto.estado),
        resumenFinal: createPlanItemDto.resumenFinal?.trim() || null,
      }),
    );

    return this.findOneByItem(item.idPlanItem);
  }

  async updateItem(itemId: number, updatePlanItemDto: UpdatePlanItemDto) {
    const currentItem = await this.planItemsRepository.findOne({
      where: { idPlanItem: itemId },
    });

    if (!currentItem) {
      throw new NotFoundException('Ítem de planificación no encontrado.');
    }

    const nextAreaId = updatePlanItemDto.idAreaPlan ?? currentItem.idAreaPlan;

    await this.ensureAreaBelongsToPlan(currentItem.idPlanAnual, nextAreaId);
    await this.ensureUserExistsIfNeeded(updatePlanItemDto.idResponsable);

    await this.planItemsRepository.save(
      this.planItemsRepository.create({
        ...currentItem,
        idAreaPlan: nextAreaId,
        idResponsable:
          updatePlanItemDto.idResponsable !== undefined
            ? updatePlanItemDto.idResponsable
            : currentItem.idResponsable,
        titulo: updatePlanItemDto.titulo?.trim() ?? currentItem.titulo,
        descripcion:
          updatePlanItemDto.descripcion?.trim() ?? currentItem.descripcion,
        resultadoEsperado:
          updatePlanItemDto.resultadoEsperado?.trim() ??
          currentItem.resultadoEsperado,
        prioridad: updatePlanItemDto.prioridad ?? currentItem.prioridad,
        estado: updatePlanItemDto.estado ?? currentItem.estado,
        fechaPlanificada:
          updatePlanItemDto.fechaPlanificada ?? currentItem.fechaPlanificada,
        fechaCumplimientoReal:
          updatePlanItemDto.fechaCumplimientoReal !== undefined
            ? updatePlanItemDto.fechaCumplimientoReal
            : (currentItem.fechaCumplimientoReal ??
              this.resolveCompletionDate(updatePlanItemDto.estado)),
        resumenFinal:
          updatePlanItemDto.resumenFinal !== undefined
            ? updatePlanItemDto.resumenFinal.trim() || null
            : currentItem.resumenFinal,
      }),
    );

    return this.findOneByItem(itemId);
  }

  async createFollowup(
    itemId: number,
    createPlanFollowupDto: CreatePlanFollowupDto,
    actorUserId: number,
  ) {
    const currentItem = await this.planItemsRepository.findOne({
      where: { idPlanItem: itemId },
    });

    if (!currentItem) {
      throw new NotFoundException('Ítem de planificación no encontrado.');
    }

    await this.ensureUserExists(actorUserId);

    await this.dataSource.transaction(async (manager) => {
      const planItemsRepository = manager.getRepository(PlanItemEntity);
      const planFollowupsRepository = manager.getRepository(
        PlanSeguimientoEntity,
      );

      await planFollowupsRepository.save(
        planFollowupsRepository.create({
          idPlanItem: itemId,
          registradoPorId: actorUserId,
          fechaSeguimiento: new Date(),
          estado: createPlanFollowupDto.estado,
          avancePorcentaje: createPlanFollowupDto.avancePorcentaje,
          comentario: createPlanFollowupDto.comentario.trim(),
          bloqueos: createPlanFollowupDto.bloqueos?.trim() || null,
          proximoPaso: createPlanFollowupDto.proximoPaso?.trim() || null,
          funcionoBien: createPlanFollowupDto.funcionoBien?.trim() || null,
          porMejorar: createPlanFollowupDto.porMejorar?.trim() || null,
        }),
      );

      await planItemsRepository.save(
        planItemsRepository.create({
          ...currentItem,
          estado: createPlanFollowupDto.estado,
          fechaCumplimientoReal:
            currentItem.fechaCumplimientoReal ??
            this.resolveCompletionDate(createPlanFollowupDto.estado),
        }),
      );
    });

    return this.findOneByItem(itemId);
  }

  private async findOneByItem(itemId: number) {
    const item = await this.planItemsRepository.findOne({
      where: { idPlanItem: itemId },
    });

    if (!item) {
      throw new NotFoundException('Ítem de planificación no encontrado.');
    }

    return this.findOne(item.idPlanAnual);
  }

  private async syncPlanAreas(
    planAreasRepository: Repository<PlanAreaEntity>,
    planId: number,
    nextAreas: Array<{
      idAreaPlan?: number;
      nombre: string;
      descripcion: string | null;
      orden: number;
    }>,
  ) {
    const currentAreas = await planAreasRepository.find({
      where: { idPlanAnual: planId },
      relations: {
        items: true,
      },
      order: {
        orden: 'ASC',
        nombre: 'ASC',
      },
    });

    const currentAreaById = new Map(
      currentAreas.map((area) => [area.idAreaPlan, area]),
    );
    const nextAreaIds = new Set(
      nextAreas
        .map((area) => area.idAreaPlan)
        .filter((areaId): areaId is number => Boolean(areaId)),
    );

    for (const area of currentAreas) {
      if (!nextAreaIds.has(area.idAreaPlan)) {
        if ((area.items?.length ?? 0) > 0) {
          throw new BadRequestException(
            `No se puede quitar el área "${area.nombre}" porque ya tiene ítems asociados.`,
          );
        }

        await planAreasRepository.delete({ idAreaPlan: area.idAreaPlan });
      }
    }

    for (const area of nextAreas) {
      if (area.idAreaPlan) {
        const currentArea = currentAreaById.get(area.idAreaPlan);

        if (!currentArea || currentArea.idPlanAnual !== planId) {
          throw new BadRequestException(
            'Una de las áreas no pertenece al plan.',
          );
        }

        await planAreasRepository.save(
          planAreasRepository.create({
            ...currentArea,
            nombre: area.nombre,
            descripcion: area.descripcion,
            orden: area.orden,
          }),
        );
        continue;
      }

      await planAreasRepository.save(
        planAreasRepository.create({
          idPlanAnual: planId,
          nombre: area.nombre,
          descripcion: area.descripcion,
          orden: area.orden,
        }),
      );
    }
  }

  private async ensurePlanExists(planId: number) {
    const plan = await this.annualPlansRepository.findOneBy({
      idPlanAnual: planId,
    });

    if (!plan) {
      throw new NotFoundException('Plan anual no encontrado.');
    }
  }

  private async ensureAreaBelongsToPlan(planId: number, areaId: number) {
    const area = await this.planAreasRepository.findOneBy({
      idAreaPlan: areaId,
      idPlanAnual: planId,
    });

    if (!area) {
      throw new NotFoundException(
        'El área seleccionada no existe para este plan.',
      );
    }
  }

  private async ensureUserExistsIfNeeded(userId?: number | null) {
    if (userId == null) {
      return;
    }

    await this.ensureUserExists(userId);
  }

  private async ensureUserExists(userId: number) {
    const user = await this.usersRepository.findOneBy({
      idUsuario: userId,
    });

    if (!user) {
      throw new NotFoundException('El usuario seleccionado no existe.');
    }
  }

  private normalizeAreas(
    areas: Array<{
      idAreaPlan?: number;
      nombre: string;
      descripcion?: string;
      orden?: number;
    }>,
  ) {
    const normalizedAreas = areas.map((area, index) => ({
      idAreaPlan: area.idAreaPlan,
      nombre: area.nombre.trim(),
      descripcion: area.descripcion?.trim() || null,
      orden: area.orden ?? index + 1,
    }));

    if (normalizedAreas.some((area) => !area.nombre)) {
      throw new BadRequestException('Todas las áreas deben tener nombre.');
    }

    const seenNames = new Set<string>();

    for (const area of normalizedAreas) {
      const normalizedName = area.nombre.toLowerCase();

      if (seenNames.has(normalizedName)) {
        throw new BadRequestException(
          'No puedes repetir nombres de áreas dentro del mismo plan.',
        );
      }

      seenNames.add(normalizedName);
    }

    return normalizedAreas;
  }

  private mapPlanDetail(plan: PlanAnualEntity) {
    const items = [...(plan.items ?? [])]
      .sort((first, second) => {
        if (first.fechaPlanificada === second.fechaPlanificada) {
          return first.titulo.localeCompare(second.titulo);
        }

        return first.fechaPlanificada.localeCompare(second.fechaPlanificada);
      })
      .map((item) => this.mapItem(item));

    const summary = this.buildSummary(plan.items ?? []);

    return {
      idPlanAnual: plan.idPlanAnual,
      anio: plan.anio,
      nombre: plan.nombre,
      estado: plan.estado,
      objetivoGeneral: plan.objetivoGeneral,
      areas: [...(plan.areas ?? [])]
        .sort((first, second) => first.orden - second.orden)
        .map((area) => ({
          idAreaPlan: area.idAreaPlan,
          nombre: area.nombre,
          descripcion: area.descripcion,
          orden: area.orden,
          itemCount: items.filter(
            (item) => item.area.idAreaPlan === area.idAreaPlan,
          ).length,
        })),
      items,
      summary,
      transparencyNotes: {
        cumplidoVsTotal: `${summary.cumplidos} de ${summary.totalItems} compromisos cerrados como cumplidos`,
        pendientesCriticos:
          summary.atrasados > 0
            ? `${summary.atrasados} ítems están atrasados y requieren seguimiento`
            : 'No hay ítems atrasados al día de hoy',
      },
    };
  }

  private mapItem(item: PlanItemEntity) {
    const followups = [...(item.seguimientos ?? [])]
      .sort(
        (first, second) =>
          second.fechaSeguimiento.getTime() - first.fechaSeguimiento.getTime(),
      )
      .map((followup) => ({
        idPlanSeguimiento: followup.idPlanSeguimiento,
        fechaSeguimiento: followup.fechaSeguimiento,
        estado: followup.estado,
        avancePorcentaje: followup.avancePorcentaje,
        comentario: followup.comentario,
        bloqueos: followup.bloqueos,
        proximoPaso: followup.proximoPaso,
        funcionoBien: followup.funcionoBien,
        porMejorar: followup.porMejorar,
        registradoPor: followup.registradoPor
          ? {
              idUsuario: followup.registradoPor.idUsuario,
              nombre: followup.registradoPor.nombre,
            }
          : null,
      }));

    return {
      idPlanItem: item.idPlanItem,
      titulo: item.titulo,
      descripcion: item.descripcion,
      resultadoEsperado: item.resultadoEsperado,
      prioridad: item.prioridad,
      estado: item.estado,
      fechaPlanificada: item.fechaPlanificada,
      fechaCumplimientoReal: item.fechaCumplimientoReal,
      resumenFinal: item.resumenFinal,
      area: {
        idAreaPlan: item.area.idAreaPlan,
        nombre: item.area.nombre,
      },
      responsable: item.responsable
        ? {
            idUsuario: item.responsable.idUsuario,
            nombre: item.responsable.nombre,
          }
        : null,
      lastProgress: followups[0]?.avancePorcentaje ?? 0,
      followups,
    };
  }

  private buildSummary(items: PlanItemEntity[]) {
    const today = new Date().toISOString().slice(0, 10);

    const counts = items.reduce(
      (accumulator, item) => {
        accumulator.totalItems += 1;

        switch (item.estado) {
          case EstadoPlanItem.CUMPLIDO:
            accumulator.cumplidos += 1;
            break;
          case EstadoPlanItem.EN_CURSO:
            accumulator.enCurso += 1;
            break;
          case EstadoPlanItem.PARCIALMENTE_CUMPLIDO:
            accumulator.parcialmenteCumplidos += 1;
            break;
          case EstadoPlanItem.NO_CUMPLIDO:
            accumulator.noCumplidos += 1;
            break;
          case EstadoPlanItem.CANCELADO:
            accumulator.cancelados += 1;
            break;
          default:
            accumulator.pendientes += 1;
            break;
        }

        if (
          !FINAL_PLAN_ITEM_STATES.has(item.estado) &&
          item.fechaPlanificada < today
        ) {
          accumulator.atrasados += 1;
        }

        return accumulator;
      },
      {
        totalItems: 0,
        pendientes: 0,
        enCurso: 0,
        cumplidos: 0,
        parcialmenteCumplidos: 0,
        noCumplidos: 0,
        cancelados: 0,
        atrasados: 0,
      },
    );

    return {
      ...counts,
      porcentajeCumplimiento:
        counts.totalItems === 0
          ? 0
          : Math.round((counts.cumplidos / counts.totalItems) * 100),
    };
  }

  private resolveCompletionDate(estado?: EstadoPlanItem) {
    return estado && FINAL_PLAN_ITEM_STATES.has(estado)
      ? new Date().toISOString().slice(0, 10)
      : null;
  }

  private handleDuplicatePlan(error: unknown): never {
    const driverError =
      error instanceof QueryFailedError &&
      typeof error.driverError === 'object' &&
      error.driverError !== null
        ? (error.driverError as Record<string, unknown>)
        : null;

    if (
      error instanceof QueryFailedError &&
      driverError &&
      driverError.code === 'ER_DUP_ENTRY'
    ) {
      throw new BadRequestException(
        'Ya existe un plan anual o un área con esos datos.',
      );
    }

    throw error;
  }
}
