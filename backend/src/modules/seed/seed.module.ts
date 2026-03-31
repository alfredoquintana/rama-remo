import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  ItemEntity,
  MenuEntity,
  MenuRolEntity,
  RolEntity,
  UsuarioEntity,
  UsuarioRolEntity,
} from '../../database/entities';
import { SeedService } from './seed.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RolEntity,
      MenuEntity,
      ItemEntity,
      MenuRolEntity,
      UsuarioEntity,
      UsuarioRolEntity,
    ]),
  ],
  providers: [SeedService],
})
export class SeedModule {}
