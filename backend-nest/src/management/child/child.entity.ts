import { PartialType } from "@nestjs/mapped-types";
import { IsNumber, IsOptional, IsString, MaxLength, IsDate, MinDate, MaxDate, IsInt, IsPositive, IsBoolean, IsArray } from "class-validator";
import { PersonEntity } from "../person/person.entity";
import { IAccountEntity, IChildEntity, ICreateChild, IGoalEntity, IPersonEntity, IProgramEntity, IStrengthEntity } from '../../../../interfaces'
import { Type } from "class-transformer";
import { GoalEntity } from "../goal/Goal.entity";
import { AccountEntity } from "../account/account.entity";
import { ProgramEntity } from "../program/program.entity";
import { Column, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
export class CreateChild implements ICreateChild {
	@IsNumber() @IsOptional()
	@Column({ type: 'tinyint', unique: false, nullable: true })
	public femaleFamilyMembers?: number;

	@IsNumber() @IsOptional()
	@Column({ type: 'tinyint', unique: false, nullable: true })
	public maleFamilyMembers?: number;

	@IsNumber() @IsOptional()
	@Column({ type: 'tinyint', unique: false, nullable: true })
	public birthOrder?: number;

	@IsString() @IsOptional() @MaxLength(512)
	@Column({ type: 'nvarchar', length: 512, unique: false, nullable: true })
	public parentsKinship?: string;

	@IsOptional() @Type(() => Date)
	@IsDate() @MinDate(new Date('1900-01-01')) @MaxDate(new Date('2075-01-01'))
	@Column({ type: 'date', unique: false, nullable: true })
	public diagnosticDate?: string;

	@IsString() @IsOptional() @MaxLength(512)
	@Column({ type: 'nvarchar', length: 512, unique: false, nullable: true })
	public pregnancyState?: string;

	@IsString() @IsOptional() @MaxLength(512)
	@Column({ type: 'nvarchar', length: 512, unique: false, nullable: true })
	public birthState?: string;

	@IsString() @IsOptional() @MaxLength(512)
	@Column({ type: 'nvarchar', length: 512, unique: false, nullable: true })
	public growthState?: string;

	@IsString() @IsOptional() @MaxLength(512)
	@Column({ type: 'nvarchar', length: 512, unique: false, nullable: true })
	public diagnostic?: string;

	@IsString() @IsOptional() @MaxLength(512)
	@Column({ type: 'nvarchar', length: 512, unique: false, nullable: true })
	public medicine?: string;

	@IsString() @IsOptional() @MaxLength(512)
	@Column({ type: 'nvarchar', length: 512, unique: false, nullable: true })
	public behaviors?: string;

	@IsString() @IsOptional() @MaxLength(512)
	@Column({ type: 'nvarchar', length: 512, unique: false, nullable: true })
	public prioritySkills?: string;

	@IsBoolean() @IsOptional()
	@Column({ type: 'bool', nullable: false, default: false })
	public isArchive: boolean;

	@IsNumber() @IsOptional() @IsInt() @IsPositive()
	@Column({ type: 'int', unsigned: true, unique: false, nullable: true })
	public parentId?: number;

	@IsNumber() @IsPositive() @IsInt()
	@Column({ type: 'int', unsigned: true, unique: true, nullable: false })
	public personId: number;

	@IsArray() @Type(() => AccountEntity) @IsOptional()
	@ManyToMany(() => AccountEntity, (account) => account.teaches, { onDelete: 'CASCADE' })
	public teachers: IAccountEntity[];

	@IsNumber() @IsOptional() @IsInt() @IsPositive()
	@Column({ type: 'int', unsigned: true, unique: false, nullable: true })
	public programId?: number
}

@Entity()
export class ChildEntity extends CreateChild implements IChildEntity {
	@PrimaryGeneratedColumn({ type: 'int', unsigned: true })
	public id: number;

	@ManyToOne(() => AccountEntity, (parent) => parent.children, { nullable: true, onDelete: 'SET NULL' })
	public parent?: IAccountEntity;

	@OneToMany(() => GoalEntity, (goal) => goal.child)
	public goals: IGoalEntity[];
	public strengths: IStrengthEntity[];//a place holder

	@OneToOne(() => PersonEntity, { nullable: false, onDelete: 'CASCADE' })
	@JoinColumn()
	public person: IPersonEntity;

	@ManyToOne(() => ProgramEntity, (program) => program.children, { nullable: true, onDelete: 'SET NULL' })
	public program: IProgramEntity;
}

export class UpdateChild extends PartialType(CreateChild) { }