import { BadRequestException, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { STATUS_CODES } from 'http';
import { Pool, createPool } from 'mysql2';
import { CreateField, FieldEntity, UpdateField } from 'src/management/field/field.entity';
import { CreatePerformance, PerformanceEntity, UpdatePerformance } from 'src/management/performance/performance.entity';
import { CreateProgram, ProgramEntity, UpdateProgram } from 'src/management/program/program.entity';


@Injectable()
export class DatabaseService {
    private readonly db: Pool;
    constructor() {
        this.db = createPool({
            host: process.env.HOST_DB,
            port: Number(process.env.PORT_DB),
            user: process.env.USER_DB,
            password: process.env.PASSWORD_DB,
            database: process.env.DATABASE,
            multipleStatements: true,
        });
    }

    /**
       * example: select('*','field',"field.name like ?;",['%hi'])
       * => query("SELECT * FROM field WHERE field.name like ?",['%hi'])
       */
    public select(select: string, from: TableName, where?: string, values?: (string | number)[]) {
        let command = '';
        if (select && from)
            command = `SELECT ${select} FROM ${from}`;
        else throw new BadRequestException();
        if (where)
            command += ` WHERE ${where}`;
        if (values)
            return this.exec(command, values);
        else return this.exec(command);
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
        const tablesRes: Entities[]/*: [[Table0 result],[Table1 result], ...] */ = await this.exec(command, values);
        return this.relational2Object(tablesRes, tables.map((v) => v.includes('View') ? v.substring(0, v.indexOf('View')) as TableName : v));
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
        return this.exec(`DELETE FROM ${table} WHERE id=?`,[id]);
    }

    /**
     * 
     * @param results array of result query. Usually in multi statements query. ex:[[...of performance],[...of fields],...]
     * @param resultsTables array of table name correspond to results so in prev. ex. ['performance','field',...]
     * @returns one dimension array of first results array. con. of prev. ex. [{performance obj. with correspond field:{obj.}}] if exist dah
     */
    private relational2Object(results: Entities[], resultsTables: TableName[]): Entity[] {
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
    private exec(sql: string, values?: (number | string)[]): Promise<any> {
        return new Promise((res, rej) => {
            let callback = (e, result) => {
                if (e) return rej(e);
                else return res(result);
            };
            if (values != null)
                this.db.query(sql, values, callback);
            else this.db.query(sql, callback);
        });
    }

    private extractValues(obj: object): (string | number)[] {
        let values: (number | string)[] = [];
        if(typeof obj != 'object')
            throw new BadRequestException('Expected request body to be object!')
        for (let v of Object.values(obj)) {
            if (typeof v === 'number')
                values.push(v)
            else if (v.length <= 24 && v.includes('T') && v.indexOf('Z') + 1 == v.length)//if date (e.g., '2023-02-03T16:18:58.880Z')
                values.push(new Date(v).toISOString().slice(0, 19).replace('T', ' '))
            else values.push(v.toString());
        }
        if (values.length == 0)
            throw new BadRequestException('No property in the body object!');
        return values;
    }
}

export type TableName = 'person' | 'account' | 'parent' | 'teacher' | 'hd' | 'child' | 'teacher_child' | 'program' | 'field' | 'fieldView' | 'performance' | 'goal' | 'evaluation';
export type Entity = PerformanceEntity | FieldEntity | ProgramEntity;//todo...
export type CreateEntity = CreatePerformance | CreateField | CreateProgram;//todo...
export type UpdateEntity = UpdatePerformance | UpdateField | UpdateProgram;//todo...
export type Entities = PerformanceEntity[] | FieldEntity[] | ProgramEntity[];//todo...


