import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { CreatePlanFollowupDto } from './dto/create-plan-followup.dto';
import { CreatePlanItemDto } from './dto/create-plan-item.dto';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanItemDto } from './dto/update-plan-item.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { PlanningService } from './planning.service';

type AuthenticatedRequest = Request & {
  user?: {
    sub: number;
  };
};

@Controller('planning/annual-plans')
export class PlanningController {
  constructor(private readonly planningService: PlanningService) {}

  @Get()
  findAll() {
    return this.planningService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.planningService.findOne(id);
  }

  @Post()
  create(@Body() createPlanDto: CreatePlanDto) {
    return this.planningService.create(createPlanDto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePlanDto: UpdatePlanDto,
  ) {
    return this.planningService.update(id, updatePlanDto);
  }

  @Post(':id/items')
  createItem(
    @Param('id', ParseIntPipe) id: number,
    @Body() createPlanItemDto: CreatePlanItemDto,
  ) {
    return this.planningService.createItem(id, createPlanItemDto);
  }

  @Patch('items/:itemId')
  updateItem(
    @Param('itemId', ParseIntPipe) itemId: number,
    @Body() updatePlanItemDto: UpdatePlanItemDto,
  ) {
    return this.planningService.updateItem(itemId, updatePlanItemDto);
  }

  @Post('items/:itemId/follow-ups')
  createFollowup(
    @Req() request: AuthenticatedRequest,
    @Param('itemId', ParseIntPipe) itemId: number,
    @Body() createPlanFollowupDto: CreatePlanFollowupDto,
  ) {
    return this.planningService.createFollowup(
      itemId,
      createPlanFollowupDto,
      request.user!.sub,
    );
  }
}
