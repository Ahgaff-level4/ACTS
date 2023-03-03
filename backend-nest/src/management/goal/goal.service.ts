import { Injectable } from '@nestjs/common';
import { CreateGoal, GoalEntity, UpdateGoal } from './Goal.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivityEntity } from '../activity/activity.entity';
import { TeacherEntity } from '../teacher/teacher.entity';

@Injectable()
export class GoalService {
  constructor(@InjectRepository(GoalEntity) private repo:Repository<GoalEntity>) { }

  create(createGoal: CreateGoal) {
    return this.repo.save(this.repo.create(createGoal))
  }

  async findAll(fk: boolean) {
    if (fk)
      return this.repo
      .createQueryBuilder('goal')
      .leftJoinAndMapOne('goal.activity',ActivityEntity,'activity','goal.activityId=activity.id')
      .leftJoinAndMapOne('goal.teacher',TeacherEntity,'teacher','goal.teacherId=teacher.id')
      .getMany();
    else return this.repo.find();
  }

  async findOne(id: number) {
    // return this.db.selectJoinOne(['goal', 'childView','performance'], id)
  }

  update(id: number, updateGoal: UpdateGoal) {
    // return this.db.update('goal', id, updateGoal);
  }

  remove(id: number) {
    // return this.db.delete('goal',id);
  }
}