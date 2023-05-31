import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseInterceptors } from '@nestjs/common';
import { Roles } from 'src/auth/Role.guard';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateField, FieldEntity, UpdateField } from './field.entity';
@Controller('api/field')
export class FieldController {

  constructor(@InjectRepository(FieldEntity) private repo: Repository<FieldEntity>) { }

  @Post()
  @Roles('Admin', 'HeadOfDepartment')
  create(@Body() createField: CreateField) {
    return this.repo.save(this.repo.create(createField))
  }

  @Get()
  @Roles('Admin', 'HeadOfDepartment', 'Teacher','Parent')
  findAll() {
    return this.repo.createQueryBuilder('field')
      .loadRelationCountAndMap('field.activityCount', 'field.activities')
      .getMany();
  }

  // @Get(':id')
  // @Roles('Admin', 'HeadOfDepartment', 'Teacher')
  // findOne(@Param('id', ParseIntPipe) id: number) {
  //   return this.repo.findBy({ id });
  // }

  @Patch(':id')
  @Roles('Admin', 'HeadOfDepartment')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateField: UpdateField) {
    return this.repo.update(+id, updateField);
  }

  @Delete(':id')
  @Roles('Admin', 'HeadOfDepartment')
  remove(@Param('id', ParseIntPipe) id: string) {
    return this.repo.delete(+id);
  }
}
