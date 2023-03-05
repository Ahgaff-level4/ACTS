import { Injectable } from '@nestjs/common';
import { CreateEvaluation, EvaluationEntity, UpdateEvaluation } from './evaluation.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GoalEntity } from '../goal/Goal.entity';
import { AccountEntity } from '../account/account.entity';

@Injectable()
export class EvaluationService {
  constructor(@InjectRepository(EvaluationEntity) private repo: Repository<EvaluationEntity>) { }

  create(createEvaluation: CreateEvaluation) {
    this.repo.save(this.repo.create(createEvaluation));
  }

  async findAllOfGoal(fk: boolean, goalId: number) {
    if (fk)
      return this.repo
        .createQueryBuilder('evaluation')
        .leftJoinAndMapOne('evaluation.goal', GoalEntity, 'goal', 'evaluation.goalId=goal.id')
        .leftJoinAndMapOne('evaluation.teacher', AccountEntity, 'teacher', 'evaluation.teacherId=teacher.id')
        .getMany();
    else return this.repo.find();
  }

  async findAll(fk: boolean) {
    // if (fk)
    //   return this.db.selectJoin(['evaluation', 'teacher', 'goal'])
    // else return this.db.select('*', 'evaluation')
  }

  async findOne(id: number) {
    return this.repo
      .createQueryBuilder('evaluation')
      .leftJoinAndMapOne('evaluation.goal', GoalEntity, 'goal', 'evaluation.goalId=goal.id')
      .leftJoinAndMapOne('evaluation.teacher', AccountEntity, 'teacher', 'evaluation.teacherId=teacher.id')
      .where('evaluation.id=:id',{id})
      .getMany();
  }

  update(id: number, updateEvaluation: UpdateEvaluation) {
    return this.repo.update(+id,updateEvaluation);
  }

  remove(id: number) {
    return this.repo.delete(+id)
  }
}