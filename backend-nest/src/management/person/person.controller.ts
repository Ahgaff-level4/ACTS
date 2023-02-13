import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseInterceptors } from '@nestjs/common';
import { DatabaseService } from 'src/database.service';
import { CreatePerson, PersonEntity, UpdatePerson } from './person.entity';
import { SuccessInterceptor } from 'src/success.interceptor';
import { RowDataPacket } from 'mysql2';
import { Role, Roles } from 'src/auth/Role.guard';
@Controller('api/person')
export class PersonController {
  constructor(private readonly db: DatabaseService) { }

  @Post()
  @Roles(Role.Admin,Role.HeadOfDepartment,Role.Teacher)
  create(@Body() createPerson: CreatePerson) {
    return this.db.create('person', createPerson);
  }

  @Get()
  @Roles(Role.Admin,Role.HeadOfDepartment,Role.Teacher)
  async findAll() {
    return (await this.db.select('*', 'personView') as RowDataPacket[]).map((v) => {
      if(v.isMale != null)
        v.isMale = v.isMale==0?false:true;
      return v;
    });
  }

  @Get(':id')
  @Roles(Role.Admin,Role.HeadOfDepartment,Role.Teacher)
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return (await this.db.select('*', 'personView', 'id=?', [id]) as RowDataPacket[]).map((v) => {
      if(v.isMale != null)
        v.isMale = v.isMale==0?false:true;
      return v;
    });
  }

  @Patch(':id')
  @Roles(Role.Admin,Role.HeadOfDepartment)
  update(@Param('id', ParseIntPipe) id: number, @Body() updatePerson: UpdatePerson) {
    return this.db.update('person', +id, updatePerson);
  }

  @Delete(':id')
  @Roles(Role.Admin,Role.HeadOfDepartment)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.db.delete('person', +id);
  }
}
