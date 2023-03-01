import { PartialType } from "@nestjs/mapped-types";
import { FieldEntity } from "../field/field.entity";
import { ProgramEntity } from "../program/program.entity";
import { IsNotEmpty, IsNumber,IsDateString, IsOptional, IsDate, IsInt, IsPositive, IsString, MaxLength} from "class-validator";
import { Check, Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Type } from "class-transformer";
import { IActivityEntity, ICreateActivity, IFieldEntity, IGoalEntity, IProgramEntity } from "../../../../interfaces";
import { GoalEntity } from "../goal/Goal.entity";

export class CreateActivity implements ICreateActivity {
	@IsString() @MaxLength(512)
	@Column({type:'nvarchar',length:512,nullable:false,unique:true})
	public name: string;
	
	@IsNumber() @IsOptional() @IsInt()
	@Column({type:'tinyint',unsigned:true,nullable:true})
	public minAge?: number;
	
	@IsNumber() @IsOptional() @IsInt()
	@Column({type:'tinyint',unsigned:true,nullable:true})
	public maxAge?: number;
	
	@IsNumber() @IsOptional() @IsInt() @IsPositive()
	@Column({ type: 'int', unsigned: true, unique: false, nullable: true })
	public fieldId?: number;
	
	@IsNumber() @IsOptional() @IsInt() @IsPositive()
	@Column({ type: 'int', unsigned: true, unique: false, nullable: true })
	public programId?: number;
	
	@Type(()=>Date) @IsDate() @IsOptional()
	@CreateDateColumn({type:'datetime'})
	public createdDatetime?: Date;
}

export class ActivityEntity extends CreateActivity implements IActivityEntity {
	@PrimaryGeneratedColumn({type:'int',unsigned:true})
	public id: number;
	
	@ManyToOne(()=>ProgramEntity,(program)=>program.activities,{onDelete:'CASCADE',nullable:true})
	public program?: IProgramEntity;
	
	@ManyToOne(()=>FieldEntity,(field)=>field.activities,{onDelete:'SET NULL',nullable:true})
	public field?: IFieldEntity;
	
	@OneToMany(()=>GoalEntity,(goal)=>goal.activity)
	public goals:IGoalEntity[];
}

export class UpdateActivity extends PartialType(CreateActivity) { }
