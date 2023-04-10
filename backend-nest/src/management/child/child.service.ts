import { Injectable } from '@nestjs/common';
import { ChildEntity, ChildView, CreateChild, UpdateChild } from './child.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PersonView } from '../person/person.entity';

@Injectable()
export class ChildService {
  constructor(@InjectRepository(ChildEntity) private repo: Repository<ChildEntity>,
    @InjectRepository(ChildView) private view: Repository<ChildView>) { }

  create(createChild: CreateChild) {
    return this.repo.save(this.repo.create(createChild))
  }

  async findAll(fk: boolean) {
    if (fk)
      return this.view
        .createQueryBuilder('child')
        .leftJoinAndMapOne('child.person', PersonView, 'person', 'child.personId=person.id')
        .getMany();
    else
      return this.view.find()
  }

  async findOne(id: number) {
    return this.view.findBy({ id });
  }

  update(id: number, updateChild: UpdateChild) {
    console.log({id:id,updateChild})
    return this.repo.update({id}, updateChild);
  }

  remove(id: number) {
    return this.repo.delete(id);
  }

  async findChildrenOfParent(parentId: number) {
    return this.view.findBy({ parentId });
  }
}
