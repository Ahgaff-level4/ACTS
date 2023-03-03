import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseInterceptors } from '@nestjs/common';
import { CreateProgram, ProgramEntity, ProgramView, UpdateProgram } from './program.entity';
import { Roles } from 'src/auth/Role.guard';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
@Roles('Admin', 'HeadOfDepartment')
@Controller('api/program')
export class ProgramController {
  constructor(@InjectRepository(ProgramEntity) private repo: Repository<ProgramEntity>,
    @InjectRepository(ProgramView) private view: Repository<ProgramView>) { }

  @Post()
  create(@Body() createProgram: CreateProgram) {
    return this.repo.save(this.repo.create(createProgram));
  }

  @Get()
  @Roles('Admin', 'HeadOfDepartment', 'Teacher')
  findAll() {
    return this.view.find();
  }

  @Get(':id')
  @Roles('Admin', 'HeadOfDepartment', 'Teacher')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.view.findBy({ id });
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: string, @Body() updateProgram: UpdateProgram) {
    return this.repo.update(+id, updateProgram);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: string) {
    return this.repo.delete(+id);
  }
}
