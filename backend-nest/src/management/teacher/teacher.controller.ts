import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, Query } from '@nestjs/common';
import { TeacherService } from './Teacher.service';
import { ParseBoolPipe, ParseIntPipe } from '@nestjs/common/pipes';
import { CreateTeacher, UpdateTeacher } from './Teacher.entity';
import { SuccessInterceptor } from 'src/success.interceptor';
import { Role, Roles } from 'src/auth/Role.guard';

@Roles(Role.Admin)
@UseInterceptors(SuccessInterceptor)
@Controller('api/teacher')
export class TeacherController {
  constructor(private teacherService: TeacherService) {}

  @Post()
  create(@Body() createTeacher: CreateTeacher) {
    return this.teacherService.create(createTeacher);
  }

  @Get()
  findAll(@Query('FK',ParseBoolPipe) fk:boolean) {
    return this.teacherService.findAll(fk);
  }

  @Get(':id')
  findOne(@Param('id',ParseIntPipe) id: number) {
    return this.teacherService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id',ParseIntPipe) id: number, @Body() updateTeacher: UpdateTeacher) {
    return this.teacherService.update(+id, updateTeacher);
  }

  @Delete(':id')
  remove(@Param('id',ParseIntPipe) id: number) {
    return this.teacherService.remove(+id);
  }
}
