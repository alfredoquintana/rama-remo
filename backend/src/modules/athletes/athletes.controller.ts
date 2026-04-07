import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { AthletesService } from './athletes.service';
import { ChangeAthleteCategoryDto } from './dto/change-athlete-category.dto';
import { CreateAthleteDto } from './dto/create-athlete.dto';
import { ListAthletesQueryDto } from './dto/list-athletes-query.dto';

@Controller('athletes')
export class AthletesController {
  constructor(private readonly athletesService: AthletesService) {}

  @Get('users/search')
  searchUsers(@Query('term') term?: string) {
    return this.athletesService.searchUsers(term);
  }

  @Get()
  findActive(@Query() query: ListAthletesQueryDto) {
    return this.athletesService.findActive(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.athletesService.findOne(id);
  }

  @Post()
  create(@Body() createAthleteDto: CreateAthleteDto) {
    return this.athletesService.create(createAthleteDto);
  }

  @Patch(':id/category')
  changeCategory(
    @Param('id', ParseIntPipe) id: number,
    @Body() changeAthleteCategoryDto: ChangeAthleteCategoryDto,
  ) {
    return this.athletesService.changeCategory(id, changeAthleteCategoryDto);
  }
}
