import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PlanAnualEntity } from './plan-anual.entity';
import { PlanAreaEntity } from './plan-area.entity';
import { PlanSeguimientoEntity } from './plan-seguimiento.entity';
import { EstadoPlanItem, PrioridadPlanItem } from './planning.enums';
import { UsuarioEntity } from './usuario.entity';

@Entity('plan_item')
export class PlanItemEntity {
  @PrimaryGeneratedColumn({ name: 'id_plan_item' })
  idPlanItem!: number;

  @Column({ name: 'id_plan_anual' })
  idPlanAnual!: number;

  @Column({ name: 'id_area_plan' })
  idAreaPlan!: number;

  @Column({ name: 'id_responsable', nullable: true })
  idResponsable!: number | null;

  @Column({ length: 150 })
  titulo!: string;

  @Column({ type: 'longtext' })
  descripcion!: string;

  @Column({ name: 'resultado_esperado', type: 'longtext' })
  resultadoEsperado!: string;

  @Column({
    type: 'enum',
    enum: PrioridadPlanItem,
    default: PrioridadPlanItem.MEDIA,
  })
  prioridad!: PrioridadPlanItem;

  @Column({
    type: 'enum',
    enum: EstadoPlanItem,
    default: EstadoPlanItem.PENDIENTE,
  })
  estado!: EstadoPlanItem;

  @Column({ name: 'fecha_planificada', type: 'date' })
  fechaPlanificada!: string;

  @Column({ name: 'fecha_cumplimiento_real', type: 'date', nullable: true })
  fechaCumplimientoReal!: string | null;

  @Column({ name: 'resumen_final', type: 'longtext', nullable: true })
  resumenFinal!: string | null;

  @ManyToOne(() => PlanAnualEntity, (planAnual) => planAnual.items, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_plan_anual' })
  planAnual!: PlanAnualEntity;

  @ManyToOne(() => PlanAreaEntity, (area) => area.items, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'id_area_plan' })
  area!: PlanAreaEntity;

  @ManyToOne(() => UsuarioEntity, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'id_responsable' })
  responsable!: UsuarioEntity | null;

  @OneToMany(() => PlanSeguimientoEntity, (seguimiento) => seguimiento.item)
  seguimientos!: PlanSeguimientoEntity[];
}
