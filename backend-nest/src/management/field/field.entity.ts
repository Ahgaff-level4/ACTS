import { PartialType } from "@nestjs/mapped-types";
import { IsDateString, IsNotEmpty, IsOptional } from "class-validator";
import { ICreateField, IFieldEntity } from "../../../../interfaces";
// import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, ViewColumn, ViewEntity } from "typeorm";
// import { PerformanceTable } from "../performance/performance.entity";

export class CreateField implements ICreateField {
    @IsNotEmpty()
    // @ViewColumn()
    // @Column({ length: 50, unique: true, type: 'nvarchar' })
    name: string;

    @IsDateString() @IsOptional()
    // @CreateDateColumn({ type: 'datetime' })
    // @ViewColumn()
    createdDatetime: Date;
}

// // @ViewEntity({
// //     name: 'FieldEntityView',
// //     expression: `
// // 	SELECT field_table.id, field_table.name, field_table.createdDatetime,COUNT(performance_table.fieldId) AS performanceCount 
// //     FROM field_table LEFT JOIN performance_table ON performance_table.fieldId=field_table.id GROUP BY field_table.id;`
// // })
// // @Entity()
export class FieldEntity extends CreateField implements IFieldEntity {
    // @ViewColumn()
    // @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
    id: number;

    // @ViewColumn()
    performanceCount: number;

    // @OneToMany(() => PerformanceTable, (performance) => performance?.field)
    // performances: PerformanceTable[];
}

export class UpdateField extends PartialType(CreateField) { }

// @Entity()
// export class FieldTable extends CreateField implements IFieldEntity {
//     @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
//     id: number;
//     performanceCount: number;
//     @OneToMany(() => PerformanceTable, (performance) => performance?.field)
//     performances: PerformanceTable[];
// }

// @ViewEntity({
//     name: 'FieldView',
//     expression: `
// 	SELECT field_table.id, field_table.name, field_table.createdDatetime AS createdDatetime,COUNT(performance_table.fieldId) AS performanceCount 
//     FROM field_table LEFT JOIN performance_table ON performance_table.fieldId=field_table.id GROUP BY field_table.id;`
// })
// export class FieldView implements IFieldEntity {
//     @ViewColumn()
//     id: number;
//     @ViewColumn()
//     performanceCount: number;
//     @ViewColumn()
//     name: string;
//     @ViewColumn()
//     createdDatetime: Date;
//     // @ViewColumn()//i dunno...
//     performances: PerformanceTable[];
// }