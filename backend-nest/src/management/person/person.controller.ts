import { Controller, Get, Post, Body } from '@nestjs/common';
import { CreatePerson, PersonEntity, PersonView } from './person.entity';
import { Roles } from 'src/auth/Role.guard';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Controller('api/person')
export class PersonController {
  constructor(@InjectRepository(PersonEntity)
  private rep: Repository<PersonEntity>,@InjectRepository(PersonView) private view:Repository<PersonView>) { }

  @Post()
  @Roles('Admin', 'HeadOfDepartment', 'Teacher')
  create(@Body() createPerson: CreatePerson) {
    const person = this.rep.create(createPerson);
    return this.rep.save(person);
  }

  @Get()
  @Roles('Admin', 'HeadOfDepartment', 'Teacher')
  async findAll() {
    return this.view.find();
  }

  // @Get(':id')
  // @Roles('Admin', 'HeadOfDepartment', 'Teacher')
  // async findOne(@Param('id', ParseIntPipe) id: number) {
  //   return (await this.db.select('*', 'personView', 'id=?', [id]) as RowDataPacket[]).map((v) => {
  //     if (v.isMale != null)
  //       v.isMale = v.isMale == 0 ? false : true;
  //     return v;
  //   });
  // }

  // @Patch(':id')
  // @Roles('Admin', 'HeadOfDepartment')
  // update(@Param('id', ParseIntPipe) id: number, @Body() updatePerson: UpdatePerson) {
  //   return this.db.update('person', +id, updatePerson);
  // }

  // @Delete(':id')
  // @Roles('Admin', 'HeadOfDepartment')
  // remove(@Param('id', ParseIntPipe) id: number) {
  //   return this.db.delete('person', +id);
  // }
}
