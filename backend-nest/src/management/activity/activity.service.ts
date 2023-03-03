import { Injectable } from '@nestjs/common';
import { ActivityEntity, CreateActivity, UpdateActivity } from './activity.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FieldView } from '../field/field.entity';
import { ProgramView } from '../program/program.entity';

@Injectable()
export class ActivityService {
    constructor(@InjectRepository(ActivityEntity) private repo: Repository<ActivityEntity>) { }

    create(createActivity: CreateActivity) {
        return this.repo.save(this.repo.create(createActivity))
    }

    async findAll(fk: boolean) {
        if (fk)
            return this.repo
                .createQueryBuilder('activity')
                .leftJoinAndMapOne('activity.field', FieldView, 'field', 'activity.fieldId=field.id')
                .leftJoinAndMapOne('activity.program', ProgramView, 'program', 'activity.programId=program.id')
                .getMany();
        else return this.repo.find();
    }

    findOne(id: number) {
        return this.repo
            .createQueryBuilder('activity')
            .leftJoinAndMapOne('activity.field', FieldView, 'field', 'activity.fieldId=field.id')
            .leftJoinAndMapOne('activity.program', ProgramView, 'program', 'activity.programId=program.id')
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
