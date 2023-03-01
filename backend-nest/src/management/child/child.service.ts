import { Injectable } from '@nestjs/common';
import { ChildEntity, ChildView, CreateChild, UpdateChild } from './child.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class ChildService {
  constructor(@InjectRepository(ChildEntity) private repo:Repository<ChildEntity>,
    @InjectRepository(ChildView) private view:Repository<ChildView>) { }

  create(createChild: CreateChild) {
    return this.repo.save(this.repo.create(createChild))
  }

  async findAll(fk: boolean) {
    // if (fk)
    //   return (await this.db.selectJoin(['childView', 'personView', 'parent'])).map(this.ut.phoneN2array)
    // else 
    return this.view.find()
  }

  async findOne(id: number) {
    return this.view.findBy({id});
  }

  update(id: number, updateChild: UpdateChild) {
    return this.repo.update(id,updateChild);
  }

  remove(id: number) {
    return this.repo.delete(id);
  }

  async findChildrenOfParent(parentId:number){
    return this.view.findBy({parentId});
  }
}
