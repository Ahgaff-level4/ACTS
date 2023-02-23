import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseInterceptors } from '@nestjs/common';
// import { CreateProgram, ProgramTable, UpdateProgram } from './program.entity';
import { DatabaseService } from 'src/database.service';
import { Roles } from 'src/auth/Role.guard';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
@Roles('Admin', 'HeadOfDepartment')
@Controller('api/program')
export class ProgramController {
  // constructor(@InjectRepository(ProgramTable)
  // private rep: Repository<ProgramTable>) { }
  // // constructor(private readonly db: DatabaseService) { }

  // @Post()
  // create(@Body() createProgram: CreateProgram) {
  //   const program = this.rep.create(createProgram);
  //   return this.rep.save(program);
  // }

  // @Post()
  // create(@Body() createProgram: CreateProgram) {
  //   return this.db.create('program', createProgram);
  // }

  // @Get()
  // @Roles('Admin', 'HeadOfDepartment', 'Teacher')
  // findAll() {
  //   return this.db.select('*', 'programView');
  // }

  // @Get(':id')
  // @Roles('Admin', 'HeadOfDepartment', 'Teacher')
  // findOne(@Param('id', ParseIntPipe) id: number) {
  //   return this.db.select('*', 'programView', 'id=?', [id]);
  // }

  // @Patch(':id')
  // update(@Param('id', ParseIntPipe) id: string, @Body() updateProgram: UpdateProgram) {
  //   return this.db.update('program', +id, updateProgram);
  // }

  // @Delete(':id')
  // remove(@Param('id', ParseIntPipe) id: string) {
  //   return this.db.delete('program', +id);
  // }
}
