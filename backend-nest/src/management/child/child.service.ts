import { Injectable } from '@nestjs/common';
import { CreateChild, UpdateChild } from './child.entity';
import { DatabaseService } from 'src/database.service';

@Injectable()
export class ChildService {
  constructor(private db: DatabaseService) { }

  create(createChild: CreateChild) {
    return this.db.create('child', createChild)
  }

  findAll(fk: boolean) {
    if (fk)
      return this.db.selectJoin(['childView', 'personView', 'parent'])
    else return this.db.select('*', 'childView')
  }

  findOne(id: number) {
    return this.db.selectJoinOne(['childView', 'personView', 'parent'], id);
  }

  update(id: number, updateChild: UpdateChild) {
    return this.db.update('child', id, updateChild);
  }

  remove(id: number) {
    return this.db.delete('child', id);
  }
  
}
