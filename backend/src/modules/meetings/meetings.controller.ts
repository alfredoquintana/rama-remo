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
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { UpdateMeetingDto } from './dto/update-meeting.dto';
import { MeetingsService } from './meetings.service';

type AuthenticatedRequest = Request & {
  user?: {
    sub: number;
  };
};

@Controller('meetings')
export class MeetingsController {
  constructor(private readonly meetingsService: MeetingsService) {}

  @Get()
  findAll() {
    return this.meetingsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.meetingsService.findOne(id);
  }

  @Post()
  create(
    @Req() request: AuthenticatedRequest,
    @Body() createMeetingDto: CreateMeetingDto,
  ) {
    return this.meetingsService.create(createMeetingDto, request.user!.sub);
  }

  @Patch(':id')
  update(
    @Req() request: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMeetingDto: UpdateMeetingDto,
  ) {
    return this.meetingsService.update(id, updateMeetingDto, request.user!.sub);
  }
}
