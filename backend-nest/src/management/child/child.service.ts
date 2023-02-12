import { Injectable } from '@nestjs/common';
import { ChildEntity, CreateChild, UpdateChild } from './child.entity';
import { DatabaseService } from 'src/database.service';
import { UtilityService } from 'src/utility.service';

@Injectable()
export class ChildService {
  constructor(private db: DatabaseService, private ut: UtilityService) { }

  create(createChild: CreateChild) {
    return this.db.create('child', createChild)
  }

  async findAll(fk: boolean) {
    if (fk)
      return (await this.db.selectJoin(['childView', 'personView', 'parent'])).map(this.ut.phoneN2array)
    else return this.db.select('*', 'childView')
  }

  async findOne(id: number) {
    return (await this.db.selectJoinOne(['childView', 'personView', 'parent'], id)).map(this.ut.phoneN2array);
  }

  update(id: number, updateChild: UpdateChild) {
    return this.db.update('child', id, updateChild);
  }

  remove(id: number) {
    return this.db.delete('child', id);
  }
  
  async findChildrenOfParent(parentId:number){
    return (await this.db.selectJoin(['childView','personView', 'parent'],null,['WHERE childView.parentId=?'],[parentId])).map(this.ut.phoneN2array);
  }
}
