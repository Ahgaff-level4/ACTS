import { PartialType } from "@nestjs/mapped-types";
import { FieldEntity } from "../field/field.entity";
import { ProgramEntity } from "../program/program.entity";
import { IsNotEmpty, IsNumber,IsDateString, IsOptional} from "class-validator";
import { Check, Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

export class CreatePerformance {
	@IsNotEmpty()
	name: string;
	@IsNumber() @IsOptional()
	minAge?: number;
	@IsNumber() @IsOptional()
	maxAge?: number;
	@IsNumber() @IsOptional()
	fieldId?: number;
	@IsNumber() @IsOptional()
	programId?: number;
	@IsDateString() @IsOptional()
	createdDatetime: Date;
}

export class PerformanceEntity extends CreatePerformance {
	id: number;
	program?: ProgramEntity;
	field?: FieldEntity;
}

export class UpdatePerformance extends PartialType(CreatePerformance) { }

// @Entity()
// @Check('CH_performance_minAgeLessThanMaxAge','minAge <= maxAge')
// @Check('CH_performance_minAgeMaxAgeAreNullOrNot','(minAge IS NULL AND maxAge IS NULL)||(minAge IS NOT NULL AND maxAge IS NOT NULL)')
// @Check('CH_performance_maxAgeLessThan100','maxAge < 100')
// export class PerformanceTable{
// 	@PrimaryGeneratedColumn({type:'int',unsigned:true})
// 	id: number;
// 	@Column({length:512,type:'nvarchar',unique:true})
// 	name: string;
// 	@Column({type:'int',unsigned:true,nullable:true})
// 	minAge?: number;
// 	@Column({type:'int',unsigned:true,nullable:true})
// 	maxAge?: number;
// 	// @Column({nullable:true})
// 	// fieldId?: number;
// 	@ManyToOne(()=>FieldEntity,(field)=>field.performances,{eager:true,nullable:true,onDelete:'SET NULL'})
// 	field?: FieldEntity;
// 	// programId?: number;
// 	@ManyToOne(()=>ProgramTable,(program)=>program.performances,{nullable:true,onDelete:'CASCADE'})
// 	program?: ProgramTable;
// 	@CreateDateColumn({type:'datetime'})
// 	createdDatetime: Date;
// }