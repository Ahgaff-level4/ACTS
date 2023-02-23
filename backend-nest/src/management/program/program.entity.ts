import { PartialType } from "@nestjs/mapped-types";
import { IsDateString, IsNotEmpty, IsOptional } from "class-validator";
// import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
// import { PerformanceTable } from "../performance/performance.entity";

export class CreateProgram {
    @IsNotEmpty()
    name: string;
    @IsDateString() @IsOptional()
    createdDatetime?: Date | string;
}

export class ProgramEntity extends CreateProgram {
    id: number;
}

export class UpdateProgram extends PartialType(CreateProgram) { }

// @Entity()
// export class ProgramTable {
//     @PrimaryGeneratedColumn({unsigned:true,type:'int'})
//     id: number;
//     @Column({length:50,type:'nvarchar',unique:true})
//     name: string;
//     @OneToMany(()=>PerformanceTable,(performance)=>performance?.program)
//     performances:PerformanceTable[];
//     @CreateDateColumn({type:'datetime'})
//     createdDatetime: Date;
// }