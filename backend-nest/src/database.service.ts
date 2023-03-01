import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { OkPacket, Pool, QueryError, ResultSetHeader, RowDataPacket, createPool } from 'mysql2';
import { CreateField, FieldEntity, UpdateField } from 'src/management/field/field.entity';
import { CreatePerformance, PerformanceEntity, UpdatePerformance } from 'src/management/activity/activity.entity';
import { CreateProgram, ProgramEntity, UpdateProgram } from 'src/management/program/program.entity';
import { CreatePerson, PersonEntity, UpdatePerson } from './management/person/person.entity';
import { ChildEntity, CreateChild, UpdateChild } from './management/child/child.entity';
import { CreateParent, ParentEntity, UpdateParent } from './management/parent/parent.entity';
import { CreateHd, HdEntity, UpdateHd } from './management/hd/Hd.entity';
import { CreateTeacher, TeacherEntity, UpdateTeacher } from './management/teacher/teacher.entity';
import { CreateGoal, GoalEntity, UpdateGoal } from './management/goal/Goal.entity';
import { CreateEvaluation, EvaluationEntity, UpdateEvaluation } from './management/evaluation/evaluation.entity';
import { TableName } from './../../interfaces.d';
import { DataSource, DeepPartial, EntityManager, EntityTarget, ObjectID, ObjectLiteral, Repository, SaveOptions, UpdateResult } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';


@Injectable()
export class DatabaseService {
    public readonly manager: EntityManager;
    constructor(private dataSource: DataSource) {
        this.manager = this.dataSource.manager;
    }
    public repository(target: EntityTarget<Entity>): Repository<Entity> {
        return this.dataSource.getRepository(target);
    }

    public async create<Entity, T extends DeepPartial<Entity>>(targetOrEntity: EntityTarget<Entity>, entity: T, options?: SaveOptions): Promise<T & Entity> {
        const runner = this.dataSource.createQueryRunner();
        await runner.connect();
        await runner.startTransaction();
        try {
            const result = await runner.manager.save(targetOrEntity, entity, options);
            await runner.commitTransaction();
            return result;
        } catch (e) {
            await runner.rollbackTransaction();
            throw e;
        } finally {
            await runner.release();
        }
    }

    public async update<Entity extends ObjectLiteral>(target: EntityTarget<Entity>, criteria: string | string[] | number | number[] | Date | Date[] | ObjectID | ObjectID[] | any, partialEntity: QueryDeepPartialEntity<Entity> ): Promise<UpdateResult> {
        const runner = this.dataSource.createQueryRunner();
        await runner.connect();
        await runner.startTransaction();
        try {
            const result = await runner.manager.update(target, criteria, partialEntity);
            await runner.commitTransaction();
            return result;
        } catch (e) {
            await runner.rollbackTransaction();
            throw e;
        } finally {
            await runner.release();
        }
    }


}

export type DbResult = RowDataPacket[] | RowDataPacket[][] | OkPacket | OkPacket[] | ResultSetHeader;
export type CreateEntity = CreatePerformance | CreateField | CreateProgram | CreatePerson | CreateChild | CreateParent | CreateHd | CreateTeacher | CreateGoal | CreateEvaluation;
export type UpdateEntity = UpdatePerformance | UpdateField | UpdateProgram | UpdatePerson | UpdateChild | UpdateParent | UpdateHd | UpdateTeacher | UpdateGoal | UpdateEvaluation;
export type Entity = PerformanceEntity | FieldEntity | ProgramEntity | PersonEntity | ChildEntity | ParentEntity | HdEntity | TeacherEntity | GoalEntity | EvaluationEntity;
export type Entities = PerformanceEntity[] | FieldEntity[] | ProgramEntity[] | PersonEntity[] | ChildEntity[] | ParentEntity[] | HdEntity[] | TeacherEntity[] | GoalEntity[] | EvaluationEntity[];


