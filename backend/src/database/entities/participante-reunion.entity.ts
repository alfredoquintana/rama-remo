import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { ReunionEntity } from './reunion.entity';
import { UsuarioEntity } from './usuario.entity';

@Entity('participantes_reu')
export class ParticipanteReunionEntity {
  @PrimaryColumn({ name: 'id_reunion' })
  idReunion!: number;

  @PrimaryColumn({ name: 'id_usuario' })
  idUsuario!: number;

  @ManyToOne(() => ReunionEntity, (reunion) => reunion.participantes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_reunion' })
  reunion!: ReunionEntity;

  @ManyToOne(() => UsuarioEntity, (usuario) => usuario.participacionesReunion, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_usuario' })
  usuario!: UsuarioEntity;
}
