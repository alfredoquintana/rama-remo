import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { PlanAreaEntity } from './plan-area.entity';
import { PlanItemEntity } from './plan-item.entity';
import { EstadoPlanAnual } from './planning.enums';

@Entity('plan_anual')
@Unique(['anio'])
export class PlanAnualEntity {
  @PrimaryGeneratedColumn({ name: 'id_plan_anual' })
  idPlanAnual!: number;

  @Column({ type: 'int' })
  anio!: number;

  @Column({ length: 150 })
  nombre!: string;

  @Column({
    type: 'enum',
    enum: EstadoPlanAnual,
    default: EstadoPlanAnual.BORRADOR,
  })
  estado!: EstadoPlanAnual;

  @Column({ name: 'objetivo_general', type: 'longtext', nullable: true })
  objetivoGeneral!: string | null;

  @OneToMany(() => PlanAreaEntity, (area) => area.planAnual)
  areas!: PlanAreaEntity[];

  @OneToMany(() => PlanItemEntity, (item) => item.planAnual)
  items!: PlanItemEntity[];
}
