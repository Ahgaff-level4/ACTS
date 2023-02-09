import { Injectable } from '@nestjs/common';
import { CreateHd, UpdateHd } from './hd.entity';
import { DatabaseService } from 'src/database.service';

@Injectable()
export class HdService {
  constructor(private db: DatabaseService) { }
  create(createHd: CreateHd) {
    return this.db.create('hd', createHd);
  }

  async findAll(fk: boolean) {
    if (fk)
      return this.db.selectJoin(['hd', 'accountView'])
    else return this.db.select('*', 'hd')
  }

  async findOne(id: number) {
    return this.db.selectJoinOne(['hd', 'accountView'], id)
  }

  update(id: number, updateHd: UpdateHd) {
    return this.db.update('hd', id, updateHd);
  }

  remove(id: number) {
    return this.db.delete('hd',id);
  }
}
