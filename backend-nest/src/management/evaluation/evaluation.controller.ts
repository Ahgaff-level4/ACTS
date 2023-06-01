import { Controller, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ParseIntPipe } from '@nestjs/common/pipes';
import { CreateEvaluation, EvaluationEntity, UpdateEvaluation } from './evaluation.entity';
import { Roles } from 'src/auth/Role.guard';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationGateway } from 'src/websocket/notification.gateway';
import { UserMust } from 'src/utility.service';
import { User } from '../../../../interfaces';

@Controller('api/evaluation')
export class EvaluationController {
  constructor(@InjectRepository(EvaluationEntity) private repo: Repository<EvaluationEntity>, private notify: NotificationGateway) { }

  @Post()
  @Roles('Admin', 'Teacher')
  async create(@Body() createEvaluation: CreateEvaluation, @UserMust() user: User) {
    const ret = await this.repo.save(this.repo.create(createEvaluation));
    this.notify.emitNewNotification({
      by: user,
      controller: 'evaluation',
      datetime: new Date(),
      method: 'POST',
      payloadId: ret.id,
      payload: ret,
    });
    return ret;
  }

  @Patch(':id')
  @Roles('Admin', 'Teacher', 'HeadOfDepartment')
  async update(@Param('id', ParseIntPipe) id: number, @Body() updateEvaluation: UpdateEvaluation, @UserMust() user: User) {
    const ret = await this.repo.update(id, updateEvaluation);
    this.notify.emitNewNotification({
      by: user,
      controller: 'evaluation',
      datetime: new Date(),
      method: 'PATCH',
      payloadId: +id,
      payload: updateEvaluation,
    });
    return ret;
  }

  @Delete(':id')
  @Roles('Admin', 'Teacher', 'HeadOfDepartment')
  async remove(@Param('id', ParseIntPipe) id: number, @UserMust() user: User) {
    const ret = await this.repo.delete(id);
    this.notify.emitNewNotification({
      by: user,
      controller: 'evaluation',
      datetime: new Date(),
      method: 'DELETE',
      payloadId: +id,
      payload: ret,
    });
    return ret;
  }
}
