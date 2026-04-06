import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { PlanAnualEntity } from './plan-anual.entity';
import { PlanItemEntity } from './plan-item.entity';

@Entity('plan_area')
@Unique(['idPlanAnual', 'nombre'])
export class PlanAreaEntity {
  @PrimaryGeneratedColumn({ name: 'id_area_plan' })
  idAreaPlan!: number;

  @Column({ name: 'id_plan_anual' })
  idPlanAnual!: number;

  @Column({ length: 100 })
  nombre!: string;

  @Column({ type: 'longtext', nullable: true })
  descripcion!: string | null;

  @Column({ type: 'int', default: 1 })
  orden!: number;

  @ManyToOne(() => PlanAnualEntity, (planAnual) => planAnual.areas, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_plan_anual' })
  planAnual!: PlanAnualEntity;

  @OneToMany(() => PlanItemEntity, (item) => item.area)
  items!: PlanItemEntity[];
}
