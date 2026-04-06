import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PlanItemEntity } from './plan-item.entity';
import { EstadoPlanItem } from './planning.enums';
import { UsuarioEntity } from './usuario.entity';

@Entity('plan_seguimiento')
export class PlanSeguimientoEntity {
  @PrimaryGeneratedColumn({ name: 'id_plan_seguimiento' })
  idPlanSeguimiento!: number;

  @Column({ name: 'id_plan_item' })
  idPlanItem!: number;

  @Column({ name: 'registrado_por', nullable: true })
  registradoPorId!: number | null;

  @Column({ name: 'fecha_seguimiento', type: 'datetime' })
  fechaSeguimiento!: Date;

  @Column({
    type: 'enum',
    enum: EstadoPlanItem,
  })
  estado!: EstadoPlanItem;

  @Column({ name: 'avance_porcentaje', type: 'int', default: 0 })
  avancePorcentaje!: number;

  @Column({ type: 'longtext' })
  comentario!: string;

  @Column({ type: 'longtext', nullable: true })
  bloqueos!: string | null;

  @Column({ name: 'proximo_paso', type: 'longtext', nullable: true })
  proximoPaso!: string | null;

  @Column({ name: 'funciono_bien', type: 'longtext', nullable: true })
  funcionoBien!: string | null;

  @Column({ name: 'por_mejorar', type: 'longtext', nullable: true })
  porMejorar!: string | null;

  @ManyToOne(() => PlanItemEntity, (item) => item.seguimientos, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_plan_item' })
  item!: PlanItemEntity;

  @ManyToOne(() => UsuarioEntity, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'registrado_por' })
  registradoPor!: UsuarioEntity | null;
}
