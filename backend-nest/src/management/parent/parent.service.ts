import { Injectable } from '@nestjs/common';
import { CreateParent, UpdateParent } from './parent.entity';
import { DatabaseService } from 'src/database.service';

@Injectable()
export class ParentService {
  constructor(private db: DatabaseService) { }
  create(createParent: CreateParent) {
    return this.db.create('parent', createParent);
  }

  findAll() {
    return this.db.selectJoin(['parent', 'account'])
  }

  findOne(id: number) {
    return this.db.selectJoin(['parent', 'account'], null, ['WHERE id=?'], [id]);
  }

  update(id: number, updateParent: UpdateParent) {
    return `This action updates a #${id} parent`;
  }

  remove(id: number) {
    return `This action removes a #${id} parent`;
  }
}
