import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database.service';
import { CreateActivity, UpdateActivity } from './activity.entity';

@Injectable()
export class ActivityService {
    constructor(private db: DatabaseService) { }

    create(createPerformance: CreateActivity) {
        // return this.db.create('performance',createPerformance);
    }

    async findAll(fk:boolean) {
        // field query= select field.id,field.name,field.createdDatetime, count(performance.fieldId) AS performanceCount from field left join performance on field.id = performance.fieldId group by field.id;
        // if(fk)
        // return await this.db.selectJoin(['performance', 'fieldView', 'program']) as PerformanceEntity[];
        // else return this.db.select('*','performance')
    }

    findOne(id: number) {
        // return this.db.selectJoin(['performance', 'field','program'],['*'],['WHERE id=?'],[id])
        // return this.db.selectJoinOne(['performance', 'field','program'],id);
    }

    update(id: number, updatePerformance: UpdateActivity) {
        // return this.db.update('performance',id,updatePerformance)
    }

    remove(id: number) {
        // return this.db.delete('performance',id);
    }
}
