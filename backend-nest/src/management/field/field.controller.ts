import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseInterceptors, Inject } from '@nestjs/common';
import { Roles } from 'src/auth/Role.guard';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateField, FieldEntity, UpdateField } from './field.entity';
import { NotificationGateway } from 'src/websocket/notification.gateway';
import { UserMust } from 'src/utility.service';
import { User } from '../../../../interfaces';
import { ActivityEntity } from '../activity/activity.entity';
import { ProgramEntity } from '../program/program.entity';
@Controller('api/field')
export class FieldController {

  constructor(@InjectRepository(FieldEntity) private repo: Repository<FieldEntity>, private notify: NotificationGateway) { }

  @Post()
  @Roles('Admin', 'HeadOfDepartment')
  async create(@Body() createField: CreateField, @UserMust() user: User) {
    const ret = await this.repo.save(this.repo.create(createField))
    this.notify.emitNewNotification({
      by: user,
      controller: 'field',
      datetime: new Date(),
      method: 'POST',
      payloadId: ret.id,
      payload: ret,
    });
    return ret;
  }

  @Get()
  @Roles('Admin', 'HeadOfDepartment', 'Teacher', 'Parent')
  findAll() {
    return this.repo.createQueryBuilder('field')
      .loadRelationCountAndMap('field.activityCount', 'field.activities')
      .getMany();
  }
  
  @Get(':id')
  @Roles('Admin', 'HeadOfDepartment', 'Teacher')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.repo.createQueryBuilder('field')
      .leftJoinAndMapMany('field.activities', ActivityEntity, 'activity', 'activity.fieldId=field.id')
      .leftJoinAndMapOne('activity.program', ProgramEntity, 'program', 'activity.programId=program.id')
      .where({ id })
      .getMany();
  }

  @Patch(':id')
  @Roles('Admin', 'HeadOfDepartment')
  async update(@Param('id', ParseIntPipe) id: string, @Body() updateField: UpdateField,@UserMust() user:User) {
    const ret = await this.repo.update(+id, updateField);
    this.notify.emitNewNotification({
      by: user,
      controller: 'field',
      datetime: new Date(),
      method: 'PATCH',
      payloadId: +id,
      payload: updateField,
    });
    return ret;
  }

  @Delete(':id')
  @Roles('Admin', 'HeadOfDepartment')
  async remove(@Param('id', ParseIntPipe) id: string,@UserMust() user:User) {
    const ret =await this.repo.delete(+id);
    this.notify.emitNewNotification({
      by: user,
      controller: 'field',
      datetime: new Date(),
      method: 'DELETE',
      payloadId: +id,
      payload: ret,
    });
    return ret;
  }
}
