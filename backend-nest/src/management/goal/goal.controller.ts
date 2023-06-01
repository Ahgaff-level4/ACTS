import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ParseIntPipe } from '@nestjs/common/pipes';
import { CreateGoal, GoalEntity, UpdateGoal } from './goal.entity';
import { Roles } from 'src/auth/Role.guard';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EvaluationEntity } from '../evaluation/evaluation.entity';
import { AccountEntity } from '../account/account.entity';
import { PersonEntity } from '../person/person.entity';
import { ActivityEntity } from '../activity/activity.entity';
import { ChildEntity } from '../child/child.entity';
import { UserMust } from 'src/utility.service';
import { User } from '../../../../interfaces';
import { NotificationGateway } from 'src/websocket/notification.gateway';

@Controller('api/goal')
export class GoalController {
  
  constructor(@InjectRepository(GoalEntity) private repo: Repository<GoalEntity>, private notify: NotificationGateway) { }

  @Post()
  @Roles('Admin', 'Teacher')
  async create(@Body() createGoal: CreateGoal,@UserMust() user:User) {
    const ret = await this.repo.save(this.repo.create(createGoal));
    this.notify.emitNewNotification({
      by: user,
      controller: 'goal',
      datetime: new Date(),
      method: 'POST',
      payloadId: ret.id,
      payload: ret,
    });
    return ret;
  }

  @Get(':id')
  @Roles('Admin','HeadOfDepartment','Teacher','Parent')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.repo.createQueryBuilder('goal')
      // .leftJoinAndMapOne('goal.teacher', AccountEntity, 'goalTeacher', 'goal.teacherId=goalTeacher.id')
      // .leftJoinAndMapOne('goalTeacher.person', PersonEntity, 'personGoalTeacher', 'goalTeacher.personId=personGoalTeacher.id')
      .leftJoinAndMapMany('goal.evaluations', EvaluationEntity, 'evaluation', 'goal.id=evaluation.goalId')
      .leftJoinAndMapOne('evaluation.teacher',AccountEntity,'evaluationTeacher','evaluation.teacherId=evaluationTeacher.id')
      .leftJoinAndMapOne('evaluationTeacher.person',PersonEntity,'personEvaluationTeacher','evaluationTeacher.personId=personEvaluationTeacher.id')
      .leftJoinAndMapOne('goal.activity', ActivityEntity, 'activity', "goal.activityId=activity.id")
      .leftJoinAndMapOne('goal.child',ChildEntity,'child','goal.childId=child.id')
      .leftJoinAndMapOne('child.person',PersonEntity,'personChild','child.personId=personChild.id')
      .where('goal.id=:id', { id:+id })
      .getMany();
  }

  @Patch(':id')
  @Roles('Admin', 'HeadOfDepartment', 'Teacher')
  async update(@Param('id', ParseIntPipe) id: number, @Body() updateGoal: UpdateGoal,@UserMust() user:User) {
    const ret = await this.repo.update(+id, updateGoal);
    this.notify.emitNewNotification({
      by: user,
      controller: 'goal',
      datetime: new Date(),
      method: 'PATCH',
      payloadId: +id,
      payload: updateGoal,
    });
    return ret;
  }

  @Delete(':id')
  @Roles('Admin', 'HeadOfDepartment', 'Teacher')
  async remove(@Param('id', ParseIntPipe) id: number,@UserMust() user:User) {
    const ret = await this.repo.delete(+id);
    this.notify.emitNewNotification({
      by: user,
      controller: 'goal',
      datetime: new Date(),
      method: 'DELETE',
      payloadId: +id,
      payload: ret,
    });
    return ret;
  }
}
