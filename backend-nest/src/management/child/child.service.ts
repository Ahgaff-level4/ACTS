import { BadRequestException, Injectable } from '@nestjs/common';
import { ChildEntity, CreateChild, UpdateChild } from './child.entity';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { PersonEntity } from '../person/person.entity';
import { GoalEntity } from '../goal/Goal.entity';
import { ActivityEntity } from '../activity/activity.entity';
import { FieldEntity } from '../field/field.entity';
import { AccountEntity } from '../account/account.entity';
import { ProgramEntity } from '../program/program.entity';

@Injectable()
export class ChildService {
  findAllTeacherChildren(accountId: number) {
    return this.repo
      .createQueryBuilder('child')
      .leftJoinAndMapOne('child.person', PersonEntity, 'person', 'child.personId=person.id')
      .leftJoinAndSelect('child.teachers', 'teacher')
      .leftJoinAndMapOne('teacher.person', PersonEntity, 'teacherPerson', 'teacher.personId=teacherPerson.id')
      .leftJoinAndMapOne('child.parent', AccountEntity, 'parentAccount', 'child.parentId=parentAccount.id')
      .leftJoinAndMapOne('parentAccount.person', PersonEntity, 'parentPerson', 'parentAccount.personId=parentPerson.id')
      .where('teacher.id=:accountId', { accountId })
      .getMany();
  }

  findAllParentChildren(accountId: number) {
    return this.repo
      .createQueryBuilder('child')
      .leftJoinAndMapOne('child.person', PersonEntity, 'person', 'child.personId=person.id')
      .leftJoinAndSelect('child.teachers', 'teacher')
      .leftJoinAndMapOne('teacher.person', PersonEntity, 'teacherPerson', 'teacher.personId=teacherPerson.id')
      .leftJoinAndMapOne('child.parent', AccountEntity, 'parentAccount', 'child.parentId=parentAccount.id')
      .leftJoinAndMapOne('parentAccount.person', PersonEntity, 'parentPerson', 'parentAccount.personId=parentPerson.id')
      .where('child.parentId=:accountId', { accountId })
      .getMany();
  }
  constructor(@InjectRepository(ChildEntity) private repo: Repository<ChildEntity>,
    @InjectDataSource() private dataSource: DataSource,) { }

  async create(createChild: CreateChild) {
    const queryRunner = this.dataSource.createQueryRunner();
    const childRepo = queryRunner.manager.getRepository(ChildEntity);
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      // const person = await queryRunner.manager.getRepository(PersonEntity).save(createChild.person);
      // createChild.person = person;
      const child = await childRepo.save(childRepo.create(createChild));
      await queryRunner.commitTransaction();
      return child;
    } catch (err) {
      // since we have errors lets rollback the changes we made
      await queryRunner.rollbackTransaction();
      throw new BadRequestException()
    } finally {
      // you need to release a queryRunner which was manually instantiated
      await queryRunner.release();
    }
  }

  async findAll() {
    return this.repo
      .createQueryBuilder('child')
      .leftJoinAndMapOne('child.person', PersonEntity, 'person', 'child.personId=person.id')
      .leftJoinAndSelect('child.teachers', 'teacher')
      .leftJoinAndMapOne('teacher.person', PersonEntity, 'teacherPerson', 'teacher.personId=teacherPerson.id')
      .leftJoinAndMapOne('child.parent', AccountEntity, 'parentAccount', 'child.parentId=parentAccount.id')
      .leftJoinAndMapOne('parentAccount.person', PersonEntity, 'parentPerson', 'parentAccount.personId=parentPerson.id')
      .getMany();
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

  async update(id: number, updateChild: UpdateChild) {
    const queryRunner = this.dataSource.createQueryRunner();
    const childRepo = queryRunner.manager.getRepository(ChildEntity);
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const child = await childRepo.update(id,updateChild);
      await queryRunner.commitTransaction();
      return child;
    } catch (err) {
      // since we have errors lets rollback the changes we made
      await queryRunner.rollbackTransaction();
      throw new BadRequestException()
    } finally {
      // you need to release a queryRunner which was manually instantiated
      await queryRunner.release();
    }
    return this.repo.save({ ...updateChild, id });
  }

  remove(id: number) {
    return this.repo.delete(id);
  }

  async findChildrenOfParent(parentId: number) {
    return this.repo.findBy({ parentId });
  }
}
