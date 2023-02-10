import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseInterceptors } from '@nestjs/common';
import { CreateField,UpdateField } from './field.entity';
import { DatabaseService } from 'src/database.service';
import { SuccessInterceptor } from 'src/Success.interceptor';
@UseInterceptors(SuccessInterceptor)
@Controller('api/field')
export class FieldController {
  constructor(private readonly db: DatabaseService) {}

  @Post()
  create(@Body() createField: CreateField) {
    return this.db.create('field',createField);
  }

  @Get()
  findAll() {
    return this.db.select('*','fieldView');
  }

  @Get(':id')
  findOne(@Param('id',ParseIntPipe) id: number) {
    return this.db.select('*','fieldView','id=?',[id]);
  }

  @Patch(':id')
  update(@Param('id',ParseIntPipe) id: string, @Body() updateField: UpdateField) {
    return this.db.update('field',+id, updateField);
  }

  @Delete(':id')
  remove(@Param('id',ParseIntPipe) id: string) {
    return this.db.delete('field',+id);
  }
}
