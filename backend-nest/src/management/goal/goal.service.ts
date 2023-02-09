import { Injectable } from '@nestjs/common';
import { CreateGoal, UpdateGoal } from './Goal.entity';
import { DatabaseService } from 'src/database.service';

@Injectable()
export class GoalService {
  constructor(private db: DatabaseService) { }

  create(createGoal: CreateGoal) {
    return this.db.create('goal', createGoal);
  }

  async findAll(fk: boolean) {
    if (fk)
      return this.db.selectJoin(['goal', 'childView','performance'])
    else return this.db.select('*', 'goal')
  }

  async findOne(id: number) {
    return this.db.selectJoinOne(['goal', 'childView','performance'], id)
  }

  update(id: number, updateGoal: UpdateGoal) {
    return this.db.update('goal', id, updateGoal);
  }

  remove(id: number) {
    return this.db.delete('goal',id);
  }
}