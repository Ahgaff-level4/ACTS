import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { OkPacket, Pool, QueryError, ResultSetHeader, RowDataPacket, createPool } from 'mysql2';
import { CreateField, FieldEntity, UpdateField } from 'src/management/field/field.entity';
import { CreatePerformance, PerformanceEntity, UpdatePerformance } from 'src/management/performance/performance.entity';
import { CreateProgram, ProgramEntity, UpdateProgram } from 'src/management/program/program.entity';
import { CreatePerson, PersonEntity, UpdatePerson } from './management/person/person.entity';
import { ChildEntity, CreateChild, UpdateChild } from './management/child/child.entity';
import { CreateParent, ParentEntity, UpdateParent } from './management/parent/parent.entity';
import { CreateHd, HdEntity, UpdateHd } from './management/hd/Hd.entity';
import { CreateTeacher, TeacherEntity, UpdateTeacher } from './management/teacher/teacher.entity';
import { CreateGoal, GoalEntity, UpdateGoal } from './management/goal/Goal.entity';
import { CreateEvaluation, EvaluationEntity, UpdateEvaluation } from './management/evaluation/evaluation.entity';
import {TableName} from './../../interfaces.d';


@Injectable()
export class DatabaseService {
    private readonly db: Pool;
    constructor() {
        // this.db = createPool({
        //     host: process.env.HOST_DB,
        //     port: +process.env.PORT_DB,
        //     user: process.env.USER_DB,
        //     password: process.env.PASSWORD_DB,
        //     database: process.env.DATABASE,
        //     multipleStatements: true,
        // });
    }

    /**
       * example: select('*','field',"field.name like ?;",['%hi'])
       * => query("SELECT * FROM field WHERE field.name like ?",['%hi'])
       */
    public select(select: string, from: TableName, where?: string, values?: (string | number)[]): Promise<RowDataPacket[]> {
        let command = '';
        if (select && from)
            command = `SELECT ${select} FROM ${from}`;
        else throw new BadRequestException();
        if (where)
            command += ` WHERE ${where}`;
        if (values)
            return this.exec(command, values) as Promise<RowDataPacket[]>;
        else return this.exec(command) as Promise<RowDataPacket[]>;
    }

    /**
     * @param tables ex: ['performance','field','program'] where index 0 tableName is the return array type. So, this param will return PerformanceEntity[] type
     * @param select ex: ['*','*,count(fieldId)','*'] then in join param
     * @param join ex: ['','LEFT JOIN performance ON ['','field.id=performance.fieldId','']
     * @returns array of first type object, in the ex. performanceEntity[] with each attribute (e.g., field and program) is an object. So example type: {...,field:Field,program:Program}[]
     */
    public async selectJoin(tables: TableName[], select?: string[], other?: string[], values?: (string | number)[]) {
        if (tables && tables.length <= 1)
            throw new BadRequestException(`tablesName length is ${tables.length}. in selectJoin(...)`);
        let command = '';
        for (let i = 0; i < tables.length; i++)
            command += `SELECT ${(select && select[i]) || '*'} FROM ${tables[i]} ${(other && other[i]) || ''}; `;
        const tablesRes: RowDataPacket[][]/*: [[Table0 result],[Table1 result], ...] */ = await this.exec(command, values) as RowDataPacket[][];
        if (typeof tablesRes === 'object' &&
            typeof tablesRes.length === 'number' &&
            typeof tablesRes[0] === 'object' &&
            typeof tablesRes[0].length === 'number')
            return this.relational2Object(tablesRes, tables.map((v) => v.includes('View') ? v.substring(0, v.indexOf('View')) as TableName : v));
        else throw new InternalServerErrorException('Expected multi RowDataPacket but got', JSON.stringify(tablesRes));
    }

    /**
     * @param tables array of tables to join on `foreignKeyId = id` with first table will be the result array.
     * @param id the id of the first table 
     * @param select default: ['*','*',... for all tables]
     * @returns array length zero -not found- or one of first type object, in the ex. performanceEntity[] with each attribute (e.g., field and program) is an object. So example type: {...,field:Field,program:Program}[]
     */
    public selectJoinOne(tables: TableName[], id: number, select?: string[]) {
        //select *,@person := personId as personId from account where id =8;
        //select * from personView where  id = @person; 
        if (typeof select === 'undefined')
            select = [];
        if (typeof select[0] === 'undefined')
            select[0] = '*';

        let wheres = [];
        for (let i = 1; i < tables.length; i++) {
            var table = tables[i].includes('View') ? tables[i].substring(0, tables[i].indexOf('View')) as TableName : tables[i];
            select[0] += `, @var_${table}:=${table}Id AS ${table}Id`;
            wheres.push(`WHERE id=@var_${table}`);
        }
        return this.selectJoin(tables, select, ['WHERE id=?', ...wheres], [id]);
    }


    public create(table: TableName, obj: CreateEntity) {
        const values = this.extractValues(obj);
        return this.exec(`INSERT INTO ${table}(${Object.keys(obj).toString()}) VALUES (${',?'.repeat(values.length).substring(1)})`, values);
    }

    public update(table: TableName, id: number, obj: UpdateEntity) {
        var command = `UPDATE ${table} SET `;
        for (let key in obj)
            command += `${key} = ?, `;
        command = command.substring(0, command.length - 2);
        return this.exec(command + ` WHERE id=?;`, [...this.extractValues(obj), id]);
    }

    public delete(table: TableName, id: number) {
        return this.exec(`DELETE FROM ${table} WHERE id=?`, [id]);
    }

    /**
     * 
     * @param results array of result query. Usually in multi statements query. ex:[[...of performance],[...of fields],...]
     * @param resultsTables array of table name correspond to results so in prev. ex. ['performance','field',...]
     * @returns one dimension array of first results array. con. of prev. ex. [{performance obj. with correspond field:{obj.}}] if exist dah
     */
    private relational2Object(results: RowDataPacket[][], resultsTables: TableName[]): RowDataPacket[] {
        //let's say we have tables=['book','author'] we need array of book with book.author is Author obj correspond to book.authorId
        // var authorMap = {};
        // authors.forEach(function(author) {authorMap[author.id] = author;});
        // // now do the "join":
        // books.forEach(function(book) {
        //     book.author = authorMap[book.author_id];
        // });
        for (let i = 1; i < results.length; i++) {
            var map = {};
            results[i].forEach(o => { map[o.id] = o });
            results[0].forEach(o => { o[resultsTables[i]] = map[o[resultsTables[i] + 'Id']] });//that's why we need convention foreign key should be table name concatenated with '...Id'. (e.g., personId)
        }
        return results[0];
    }
    private exec(sql: string, values?: (number | string)[]): Promise<DbResult> {
        return new Promise((resolve, reject) => {
            let callback = (e: QueryError, result: DbResult) => {
                if (e) return reject(new BadRequestException('SQL query error!', { cause: e }));
                else return resolve(result);
            };
            if (values?.length == 0)
                throw new BadRequestException('expected values array got:' + values);
            if (values != null)
                this.db.query<DbResult>(sql, values, callback);
            else this.db.query<DbResult>(sql, callback);
        });
    }

    /**
     * Used because mysql2 use question marks to prevent sql injection. But to insert values instead of question marks mysql2 needs array of values of type either Number or String.
     * @param obj any Entity
     * @returns array of values of type String or Number
     */
    private extractValues(obj: object): (string | number)[] {
        let values: (number | string)[] = [];
        if (typeof obj != 'object')
            throw new BadRequestException('Expected request body to be object!')
        for (let k in obj) {
            if (obj[k] === null || typeof obj[k] === 'undefined')
                values.push(null);
            else if (typeof obj[k] === 'number')
                values.push(obj[k]);
            else if (typeof obj[k] === 'boolean')
                values.push(obj[k] === true ? 1 : 0);
            else if (obj[k] instanceof Date)//won't be true. But just relief
                values.push(obj[k].toISOString())
            else if (k.includes('Datetime'))//
                values.push(new Date(obj[k]).toISOString().slice(0, 19).replace('T', ' '));// convert date (e.g., '2023-02-03T16:18:58.880Z') to date and time '2023-02-03 16:18:58' the acceptable format to mysql
            else if (k.includes('Date'))
                values.push(new Date(obj[k]).toISOString().slice(0, 10));// convert date (e.g., '2023-02-03T16:18:58.880Z') to only date '2023-02-03' the acceptable format to mysql
            else values.push(obj[k].toString());//if 
        }
        if (values.length == 0)
            throw new BadRequestException('No property in the body object!');
        return values;
    }
}

export type DbResult = RowDataPacket[] | RowDataPacket[][] | OkPacket | OkPacket[] | ResultSetHeader;
export type CreateEntity = CreatePerformance | CreateField | CreateProgram | CreatePerson | CreateChild | CreateParent | CreateHd | CreateTeacher|CreateGoal|CreateEvaluation;
export type UpdateEntity = UpdatePerformance | UpdateField | UpdateProgram | UpdatePerson | UpdateChild | UpdateParent | UpdateHd | UpdateTeacher|UpdateGoal|UpdateEvaluation;
export type Entity = PerformanceEntity | FieldEntity | ProgramEntity | PersonEntity | ChildEntity | ParentEntity | HdEntity | TeacherEntity|GoalEntity|EvaluationEntity;
export type Entities = PerformanceEntity[] | FieldEntity[] | ProgramEntity[] | PersonEntity[] | ChildEntity[] | ParentEntity[] | HdEntity[] | TeacherEntity[]|GoalEntity[]|EvaluationEntity[];


