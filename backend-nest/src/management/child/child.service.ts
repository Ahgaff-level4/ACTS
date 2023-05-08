import { Injectable } from '@nestjs/common';
import { ChildEntity, CreateChild, UpdateChild } from './child.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { PersonEntity, PersonView } from '../person/person.entity';
import { GoalEntity } from '../goal/Goal.entity';
import { ActivityEntity } from '../activity/activity.entity';
import { FieldEntity } from '../field/field.entity';
import { AccountEntity } from '../account/account.entity';
import { ProgramEntity } from '../program/program.entity';

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

  async findOneItsGoals(id: number) {
    return this.repo.createQueryBuilder('child')
      .leftJoinAndMapOne('child.person', PersonEntity, 'person', 'child.personId=person.id')
      .leftJoinAndMapMany('child.goals', GoalEntity, 'goal', 'child.id=goal.childId AND goal.state != :state', { state: 'strength' })
      .leftJoinAndMapOne('goal.activity', ActivityEntity, 'activity', "goal.activityId=activity.id")
      .leftJoinAndMapOne('goal.teacher', AccountEntity, 'teacher', "goal.teacherId=teacher.id")
      .leftJoinAndMapOne('teacher.person', PersonEntity, 'teacherPerson', "teacher.personId=teacherPerson.id")
      .leftJoinAndMapOne('activity.field', FieldEntity, 'field', 'activity.fieldId=field.id')
      .leftJoinAndMapOne('activity.program', ProgramEntity, 'program', 'activity.programId=program.id')
      .where('child.id=:id', { id })
      // .andWhere('goal.state != :state', { state: 'strength' })
      .getMany();
  }

  async findOneItsStrengths(id: number) {
    return this.repo.createQueryBuilder('child')
      .leftJoinAndMapOne('child.person', PersonEntity, 'person', 'child.personId=person.id')
      .leftJoinAndMapMany('child.strengths', GoalEntity, 'goal', 'child.id=goal.childId AND goal.state = :state', { state: 'strength' })
      .leftJoinAndMapOne('goal.activity', ActivityEntity, 'activity', "goal.activityId=activity.id")
      .leftJoinAndMapOne('goal.teacher', AccountEntity, 'teacher', "goal.teacherId=teacher.id")
      .leftJoinAndMapOne('teacher.person', PersonEntity, 'teacherPerson', "teacher.personId=teacherPerson.id")
      .leftJoinAndMapOne('activity.field', FieldEntity, 'field', 'activity.fieldId=field.id')
      .leftJoinAndMapOne('activity.program', ProgramEntity, 'program', 'activity.programId=program.id')
      .where('child.id=:id', { id })
      // .andWhere('goal.state != :state', { state: 'strength' })
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
