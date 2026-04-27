import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { CompetitionsService } from './competitions.service';
import { CreateCompetitionDto } from './dto/create-competition.dto';
import { CreateCompetitionTestDto } from './dto/create-competition-test.dto';
import { UpdateCompetitionRegistrationDto } from './dto/update-competition-registration.dto';
import { UpdateCompetitionTestDto } from './dto/update-competition-test.dto';
import { UpdateCompetitionDto } from './dto/update-competition.dto';

@Controller('competitions')
export class CompetitionsController {
  constructor(private readonly competitionsService: CompetitionsService) {}

  @Get('catalogs')
  findCatalogs() {
    return this.competitionsService.findCatalogs();
  }

  @Get()
  findAll() {
    return this.competitionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.competitionsService.findOne(id);
  }

  @Post()
  create(@Body() createCompetitionDto: CreateCompetitionDto) {
    return this.competitionsService.create(createCompetitionDto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCompetitionDto: UpdateCompetitionDto,
  ) {
    return this.competitionsService.update(id, updateCompetitionDto);
  }

  @Post(':id/tests')
  createTest(
    @Param('id', ParseIntPipe) id: number,
    @Body() createCompetitionTestDto: CreateCompetitionTestDto,
  ) {
    return this.competitionsService.createTest(id, createCompetitionTestDto);
  }

  @Patch('tests/:testId')
  updateTest(
    @Param('testId', ParseIntPipe) testId: number,
    @Body() updateCompetitionTestDto: UpdateCompetitionTestDto,
  ) {
    return this.competitionsService.updateTest(
      testId,
      updateCompetitionTestDto,
    );
  }

  @Patch('tests/:testId/registration')
  updateRegistration(
    @Param('testId', ParseIntPipe) testId: number,
    @Body() updateCompetitionRegistrationDto: UpdateCompetitionRegistrationDto,
  ) {
    return this.competitionsService.updateRegistration(
      testId,
      updateCompetitionRegistrationDto,
    );
  }
}
