import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseInterceptors } from '@nestjs/common';
// import { CreateField, FieldEntity, UpdateField } from './field.entity';
import { DatabaseService } from 'src/database.service';
import { Roles } from 'src/auth/Role.guard';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
@Controller('api/field')
export class FieldController {

  // constructor(@InjectRepository(FieldEntity)
  // private rep: Repository<FieldEntity>) { }

  // @Post()
  // @Roles('Admin', 'HeadOfDepartment')
  // create(@Body() createField: CreateField) {
  //   const field = this.rep.create(createField);
  //   return this.rep.save(field);
  // }

  // @Get()
  // @Roles('Admin', 'HeadOfDepartment', 'Teacher')
  // findAll() {
  //   return this.rep.find()
  // }

  // @Get(':id')
  // @Roles('Admin', 'HeadOfDepartment', 'Teacher')
  // findOne(@Param('id', ParseIntPipe) id: number) {
  //   return this.rep.findOneBy({id});
  // }

  // @Patch(':id')
  // @Roles('Admin', 'HeadOfDepartment')
  // update(@Param('id', ParseIntPipe) id: string, @Body() updateField: UpdateField) {
  //   return this.db.update('field', +id, updateField);
  // }

  // @Delete(':id')
  // @Roles('Admin', 'HeadOfDepartment')
  // remove(@Param('id', ParseIntPipe) id: string) {
  //   return this.db.delete('field', +id);
  // }
}
