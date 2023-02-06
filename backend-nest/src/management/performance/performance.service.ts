import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database.service';
import { CreatePerformance, PerformanceEntity, UpdatePerformance } from './performance.entity';

@Injectable()
export class PerformanceService {
    constructor(private db: DatabaseService) { }

    create(createPerformance: CreatePerformance) {
        return this.db.create('performance',createPerformance);
    }

    /**
     * 
     * @param fk foreignKey is boolean determine weather the array of return object should get FK objects. Ex: if FK=false. getAll performances will return [{...,fieldId=2,field=null},...]. True will be [{...,fieldId=2,field={...}},...]. Default is True
     * @returns 
     */
    async findAll(fk: boolean) {
        // field query= select field.id,field.name,field.createdDatetime, count(performance.fieldId) AS performanceCount from field left join performance on field.id = performance.fieldId group by field.id;
        var res:PerformanceEntity[];
        if (fk)
            res = await this.db.selectJoin(['performance', 'fieldView', 'program']) as PerformanceEntity[];
        else res = await this.db.select('*', 'performance');
        return res;
    }

    findOne(id: number) {
        return this.db.selectJoin(['performance', 'field','program'],['*'],['WHERE id=?'],[id])
    }

    update(id: number, updatePerformance: UpdatePerformance) {
        return this.db.update('performance',id,updatePerformance)
    }

    remove(id: number) {
        return this.db.delete('performance',id);
    }
}
