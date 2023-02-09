import { Injectable } from '@nestjs/common';
import { CreateParent, ParentEntity, UpdateParent } from './parent.entity';
import { DatabaseService } from 'src/database.service';

@Injectable()
export class ParentService {
  constructor(private db: DatabaseService) { }
  create(createParent: CreateParent) {
    return this.db.create('parent', this.array2phoneN(createParent));
  }

  async findAll() {
    return (await this.db.selectJoin(['parent', 'account'])).map(this.phoneN2array);
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


  phoneN2array(parent) {
    let phones = [];
    for (let i = 1; i <= 10; i++) {
      if (parent['phone' + i])
        phones.push(parent['phone' + i])
      delete parent['phone' + i];
    }
    parent.phone = phones;
    return parent;
  }

  array2phoneN<T extends CreateParent>(parent: T) {
    for (let i = 1; i <= 10; i++) {
      if (parent.phone[i])
        parent['phone' + i] = parent.phone[i];
      delete parent.phone[i];
    }
    delete parent.phone;
    return parent;
  }

}
