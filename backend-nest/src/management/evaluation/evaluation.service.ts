import { Injectable } from '@nestjs/common';
import { CreateEvaluation, UpdateEvaluation } from './evaluation.entity';
import { DatabaseService } from 'src/database.service';

@Injectable()
export class EvaluationService {
  constructor(private db: DatabaseService) { }

  create(createEvaluation: CreateEvaluation) {
    return this.db.create('evaluation', createEvaluation);
  }

  async findAll(fk: boolean) {
    if (fk)
      return this.db.selectJoin(['evaluation', 'teacher', 'goal'])
    else return this.db.select('*', 'evaluation')
  }

  async findOne(id: number) {
    return this.db.selectJoinOne(['evaluation', 'teacher', 'goal'], id)
  }

  update(id: number, updateEvaluation: UpdateEvaluation) {
    return this.db.update('evaluation', id, updateEvaluation);
  }

  remove(id: number) {
    return this.db.delete('evaluation', id);
  }
}