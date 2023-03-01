import { Injectable } from '@nestjs/common';
import { CreateParent, ParentEntity, UpdateParent } from './parent.entity';
import { DatabaseService } from 'src/database.service';
import { UtilityService } from 'src/utility.service';

@Injectable()
export class ParentService {
  constructor(private db: DatabaseService, private ut:UtilityService) { }
  create(createParent: CreateParent) {
    // return this.db.create('parent', this.ut.array2phoneN(createParent));
  }

  async findAll(fk: boolean) {
    // if (fk)
      // return (await this.db.selectJoin(['parent', 'account'])).map(this.ut.phoneN2array);
    // else return (await this.db.select('*', 'parent')).map(this.ut.phoneN2array);
  }

  async findOne(id: number) {
    // return (await this.db.selectJoinOne(['parent', 'account'],id)).map(this.ut.phoneN2array);
  }

  update(id: number, updateParent: UpdateParent) {
    // return this.db.update('parent', id, this.ut.array2phoneN(updateParent));
  }

  remove(id: number) {
    // return this.db.delete('parent',id);
  }


}
