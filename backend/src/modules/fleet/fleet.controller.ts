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
import { CreateBoatDto } from './dto/create-boat.dto';
import { ListBoatsQueryDto } from './dto/list-boats-query.dto';
import { UpdateBoatDto } from './dto/update-boat.dto';
import { FleetService } from './fleet.service';

@Controller('fleet')
export class FleetController {
  constructor(private readonly fleetService: FleetService) {}

  @Get('catalogs')
  findCatalogs() {
    return this.fleetService.findCatalogs();
  }

  @Get()
  findAll(@Query() query: ListBoatsQueryDto) {
    return this.fleetService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.fleetService.findOne(id);
  }

  @Post()
  create(@Body() createBoatDto: CreateBoatDto) {
    return this.fleetService.create(createBoatDto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBoatDto: UpdateBoatDto,
  ) {
    return this.fleetService.update(id, updateBoatDto);
  }
}
