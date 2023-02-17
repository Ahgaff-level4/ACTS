import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseInterceptors } from '@nestjs/common';
import { CreateField, UpdateField } from './field.entity';
import { DatabaseService } from 'src/database.service';
import { Roles } from 'src/auth/Role.guard';
@Controller('api/field')
export class FieldController {
  constructor(private readonly db: DatabaseService) { }

  @Post()
  @Roles('Admin', 'HeadOfDepartment')
  create(@Body() createField: CreateField) {
    return this.db.create('field', createField);
  }

  @Get()
  @Roles('Admin', 'HeadOfDepartment', 'Teacher')
  findAll() {
    return this.db.select('*', 'fieldView');
  }

  @Get(':id')
  @Roles('Admin', 'HeadOfDepartment', 'Teacher')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.db.select('*', 'fieldView', 'id=?', [id]);
  }

  @Patch(':id')
  @Roles('Admin', 'HeadOfDepartment')
  update(@Param('id', ParseIntPipe) id: string, @Body() updateField: UpdateField) {
    return this.db.update('field', +id, updateField);
  }

  @Delete(':id')
  @Roles('Admin', 'HeadOfDepartment')
  remove(@Param('id', ParseIntPipe) id: string) {
    return this.db.delete('field', +id);
  }
}
