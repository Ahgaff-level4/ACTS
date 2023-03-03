import { Injectable } from '@nestjs/common';
import { CreateEvaluation, EvaluationEntity, UpdateEvaluation } from './evaluation.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GoalEntity } from '../goal/Goal.entity';
import { TeacherEntity } from '../teacher/teacher.entity';

@Injectable()
export class EvaluationService {
  constructor(@InjectRepository(EvaluationEntity) private repo:Repository<EvaluationEntity> ) { }

  create(createEvaluation: CreateEvaluation) {
    this.repo.save(this.repo.create(createEvaluation));
  }

  async findAllOfGoal(fk: boolean, goalId: number) {
    if (fk)
      return this.repo
      .createQueryBuilder('evaluation')
      .leftJoinAndMapOne('evaluation.goal',GoalEntity,'goal','evaluation.goalId=goal.id')
      .leftJoinAndMapOne('evaluation.teacher',TeacherEntity,'teacher','evaluation.teacherId=teacher.id')
      .getMany();
    else return this.repo.find();
  }

  async findAll(fk: boolean) {
    // if (fk)
    //   return this.db.selectJoin(['evaluation', 'teacher', 'goal'])
    // else return this.db.select('*', 'evaluation')
  }

  async findOne(id: number) {
    // return this.db.selectJoinOne(['evaluation', 'teacher', 'goal'], id)
  }

  update(id: number, updateEvaluation: UpdateEvaluation) {
    // return this.db.update('evaluation', id, updateEvaluation);
  }

  remove(id: number) {
    // return this.db.delete('evaluation', id);
  }
}