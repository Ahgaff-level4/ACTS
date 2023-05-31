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

@Controller('api/goal')
export class GoalController {
  
  constructor(@InjectRepository(GoalEntity) private repo: Repository<GoalEntity>) { }

  @Post()
  @Roles('Admin', 'Teacher')
  create(@Body() createGoal: CreateGoal) {
    return this.repo.save(this.repo.create(createGoal))
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
  update(@Param('id', ParseIntPipe) id: number, @Body() updateGoal: UpdateGoal) {
    return this.repo.update(+id, updateGoal);
  }

  @Delete(':id')
  @Roles('Admin', 'HeadOfDepartment', 'Teacher')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.repo.delete(+id);
  }
}
