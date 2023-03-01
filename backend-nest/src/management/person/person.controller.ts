import { Controller, Get, Post, Body, Param, ParseIntPipe, Patch, Delete } from '@nestjs/common';
import { CreatePerson, PersonEntity, PersonView, UpdatePerson } from './person.entity';
import { Roles } from 'src/auth/Role.guard';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Controller('api/person')
export class PersonController {
  constructor(@InjectRepository(PersonEntity)
  private repo: Repository<PersonEntity>, @InjectRepository(PersonView) private view:Repository<PersonView>) { }

  @Post()
  @Roles('Admin', 'HeadOfDepartment', 'Teacher')
  create(@Body() createPerson: CreatePerson) {
    return this.repo.save(this.repo.create(createPerson));
  }

  @Get()
  @Roles('Admin', 'HeadOfDepartment', 'Teacher')
  async findAll() {
    return this.view.find()
  }

  @Get(':id')
  @Roles('Admin', 'HeadOfDepartment', 'Teacher')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.view.findBy({id});
  }

  @Patch(':id')
  @Roles('Admin', 'HeadOfDepartment')
  update(@Param('id', ParseIntPipe) id: number, @Body() updatePerson: UpdatePerson) {
    return this.repo.update(id,updatePerson);
  }

  @Delete(':id')
  @Roles('Admin', 'HeadOfDepartment')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.repo.delete(id);
  }
}
