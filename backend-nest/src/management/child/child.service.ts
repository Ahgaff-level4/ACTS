import { Injectable } from '@nestjs/common';
import { ChildEntity, CreateChild, UpdateChild } from './child.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { PersonEntity, PersonView } from '../person/person.entity';
import { GoalEntity } from '../goal/Goal.entity';
import { ActivityEntity } from '../activity/activity.entity';
import { FieldEntity } from '../field/field.entity';

@Injectable()
export class ChildService {
  constructor(@InjectRepository(ChildEntity) private repo: Repository<ChildEntity>) { }

  create(createChild: CreateChild) {
    return this.repo.save(this.repo.create(createChild))
  }

  async findAll(fk: boolean) {
    if (fk)
      return this.repo
        .createQueryBuilder('child')
        .leftJoinAndMapOne('child.person', PersonEntity, 'person', 'child.personId=person.id')
        .getMany();
    else
      return this.repo.find()
  }

  async findOne(id: number) {
    return this.repo.createQueryBuilder('child')
      .leftJoinAndMapOne('child.person', PersonEntity, 'person', 'child.personId=person.id')
      .leftJoinAndMapMany('child.goals', GoalEntity, 'goal', 'child.id=goal.childId')
      .leftJoinAndMapOne('goal.activity', ActivityEntity, 'activity', "goal.activityId=activity.id")
      .leftJoinAndMapOne('activity.field', FieldEntity, 'field', 'activity.fieldId=field.id')
      .where({ id })
      .andWhere('goal.state != :state', { state: 'strength' })
      .getMany();
  }

  update(id: number, updateChild: UpdateChild) {
    return this.repo.update({ id }, updateChild);
  }

  remove(id: number) {
    return this.repo.delete(id);
  }

  async findChildrenOfParent(parentId: number) {
    return this.repo.findBy({ parentId });
  }
}
