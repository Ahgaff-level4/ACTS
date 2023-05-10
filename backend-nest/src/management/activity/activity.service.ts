import { Injectable } from '@nestjs/common';
import { ActivityEntity, CreateActivity, UpdateActivity } from './activity.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FieldEntity } from '../field/field.entity';
import { ProgramEntity } from '../program/program.entity';
import { GoalEntity } from '../goal/Goal.entity';
import { ChildEntity } from '../child/child.entity';
import { PersonEntity } from '../person/person.entity';

@Injectable()
export class ActivityService {
    constructor(@InjectRepository(ActivityEntity) private repo: Repository<ActivityEntity>) { }

    create(createActivity: CreateActivity) {
        return this.repo.save(this.repo.create(createActivity))
    }

    findSpecialActivities() {
        return this.repo
            .createQueryBuilder('activity')
            .leftJoinAndMapOne('activity.field', FieldEntity, 'field', 'activity.fieldId=field.id')
            .leftJoinAndMapMany('activity.goals', GoalEntity, 'goal', 'activity.id = goal.activityId')
            .leftJoinAndMapOne('goal.child', ChildEntity, 'child', 'child.id = goal.childId')
            .leftJoinAndMapOne('child.person', PersonEntity, 'person', 'person.id = child.personId')
            .where('activity.programId IS NULL')
            .getMany();
    }

    async findAll(fk: boolean) {
        if (fk)
            return this.repo
                .createQueryBuilder('activity')
                .leftJoinAndMapOne('activity.field', FieldEntity, 'field', 'activity.fieldId=field.id')
                .leftJoinAndMapOne('activity.program', ProgramEntity, 'program', 'activity.programId=program.id')
                .getMany();
        else return this.repo.find();
    }

    findOne(id: number) {
        return this.repo
            .createQueryBuilder('activity')
            .leftJoinAndMapOne('activity.field', FieldEntity, 'field', 'activity.fieldId=field.id')
            .leftJoinAndMapOne('activity.program', ProgramEntity, 'program', 'activity.programId=program.id')
            .where('activity.id=:id', { id })
            .getMany();
    }

    update(id: number, updateActivity: UpdateActivity) {
        return this.repo.update(id, updateActivity)
    }

    remove(id: number) {
        return this.repo.delete(id);
    }
}
