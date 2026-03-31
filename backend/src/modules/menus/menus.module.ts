import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ItemEntity, MenuEntity } from '../../database/entities';
import { MenusController } from './menus.controller';
import { MenusService } from './menus.service';

@Module({
  imports: [TypeOrmModule.forFeature([MenuEntity, ItemEntity])],
  controllers: [MenusController],
  providers: [MenusService],
})
export class MenusModule {}
