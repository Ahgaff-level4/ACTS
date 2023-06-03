import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseInterceptors, Inject } from '@nestjs/common';
import { CreateProgram, ProgramEntity, UpdateProgram } from './program.entity';
import { Roles } from 'src/auth/Role.guard';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivityEntity } from '../activity/activity.entity';
import { FieldEntity } from '../field/field.entity';
import { NotificationGateway } from 'src/websocket/notification.gateway';
import { UserMust } from 'src/utility.service';
import { User } from '../../../../interfaces';
@Roles('Admin', 'HeadOfDepartment')
@Controller('api/program')
export class ProgramController {
  constructor(@InjectRepository(ProgramEntity) private repo: Repository<ProgramEntity>,  @Inject('Notification')private notify: NotificationGateway) { }

  @Post()
  @Roles('Admin', 'HeadOfDepartment')
  async create(@Body() createProgram: CreateProgram, @UserMust() user: User) {
    const ret = await this.repo.save(this.repo.create(createProgram));
    this.notify.emitNewNotification({
      by: user,
      controller: 'program',
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
    return this.repo.createQueryBuilder('program')
      .loadRelationCountAndMap('program.activityCount', 'program.activities')
      .getMany();
  }

  @Get(':id')
  @Roles('Admin', 'HeadOfDepartment', 'Teacher')
  findOne(@Param('id', ParseIntPipe) id: number) {
    // return this.repo.find({relations:['activities'],where:{id}})
    return this.repo.createQueryBuilder('program')
      .leftJoinAndMapMany('program.activities', ActivityEntity, 'activity', 'activity.programId=program.id')
      .leftJoinAndMapOne('activity.field', FieldEntity, 'field', 'activity.fieldId=field.id')
      .where({ id })
      .getMany();
  }

  @Patch(':id')
  async update(@Param('id', ParseIntPipe) id: string, @Body() updateProgram: UpdateProgram, @UserMust() user: User) {
    const ret = await this.repo.update(+id, updateProgram);
    this.notify.emitNewNotification({
      by: user,
      controller: 'program',
      datetime: new Date(),
      method: 'PATCH',
      payloadId: +id,
      payload: updateProgram,
    });
    return ret;
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: string, @UserMust() user: User) {
    const ret = await this.repo.delete(+id);
    this.notify.emitNewNotification({
      by: user,
      controller: 'program',
      datetime: new Date(),
      method: 'POST',
      payloadId: +id,
      payload: ret,
    });
    return ret;
  }
}
