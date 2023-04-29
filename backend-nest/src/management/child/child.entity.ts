import { PartialType } from "@nestjs/mapped-types";
import { IsNumber, IsOptional, IsString, MaxLength, IsDate, MinDate, MaxDate, IsInt, IsPositive, IsBoolean } from "class-validator";
import { PersonEntity } from "../person/person.entity";
import { IAccountEntity, ICreateChild, IGoalEntity, IPersonEntity } from './../../../../interfaces.d'
import { Column, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, ViewColumn, ViewEntity } from "typeorm";
import { Type } from "class-transformer";
import { GoalEntity } from "../goal/Goal.entity";
import { AccountEntity } from "../account/account.entity";
export class CreateChild implements ICreateChild {
	@IsNumber() @IsOptional()
	@ViewColumn()
	@Column({ type: 'tinyint', unique: false, nullable: true })
	public femaleFamilyMembers?: number;

	@IsNumber() @IsOptional()
	@ViewColumn()
	@Column({ type: 'tinyint', unique: false, nullable: true })
	public maleFamilyMembers?: number;

	@IsNumber() @IsOptional()
	@ViewColumn()
	@Column({ type: 'tinyint', unique: false, nullable: true })
	public birthOrder?: number;

	@IsString() @IsOptional() @MaxLength(512)
	@ViewColumn()
	@Column({ type: 'nvarchar', length: 512, unique: false, nullable: true })
	public parentsKinship?: string;

	@IsOptional() @Type(() => Date)
	@IsDate() @MinDate(new Date('1900-01-01')) @MaxDate(new Date('2075-01-01'))
	@ViewColumn()
	@Column({ type: 'date', unique: false, nullable: true })
	public diagnosticDate?: string;

	@IsString() @IsOptional() @MaxLength(512)
	@ViewColumn()
	@Column({ type: 'nvarchar', length: 512, unique: false, nullable: true })
	public pregnancyState?: string;

	@IsString() @IsOptional() @MaxLength(512)
	@ViewColumn()
	@Column({ type: 'nvarchar', length: 512, unique: false, nullable: true })
	public birthState?: string;

	@IsString() @IsOptional() @MaxLength(512)
	@ViewColumn()
	@Column({ type: 'nvarchar', length: 512, unique: false, nullable: true })
	public growthState?: string;

	@IsString() @IsOptional() @MaxLength(512)
	@ViewColumn()
	@Column({ type: 'nvarchar', length: 512, unique: false, nullable: true })
	public diagnostic?: string;

	@IsString() @IsOptional() @MaxLength(512)
	@ViewColumn()
	@Column({ type: 'nvarchar', length: 512, unique: false, nullable: true })
	public medicine?: string;

	@IsString() @IsOptional() @MaxLength(512)
	@ViewColumn()
	@Column({ type: 'nvarchar', length: 512, unique: false, nullable: true })
	public behaviors?: string;

	@IsString() @IsOptional() @MaxLength(512)
	@ViewColumn()
	@Column({ type: 'nvarchar', length: 512, unique: false, nullable: true })
	public prioritySkills?: string;
	
	@IsBoolean() @IsOptional()
	@ViewColumn()
	@Column({ type: 'bool', nullable: false, default:false })
	public isArchive: boolean;

	@IsNumber() @IsOptional() @IsInt() @IsPositive()
	@ViewColumn()
	@Column({ type: 'int', unsigned: true, unique: false, nullable: true })
	public parentId?: number;

	@IsNumber() @IsPositive() @IsInt()
	@ViewColumn()
	@Column({ type: 'int', unsigned: true, unique: true, nullable: false })
	public personId: number;
	
	
}

@Entity()
export class ChildEntity extends CreateChild {
	@ViewColumn()
	@PrimaryGeneratedColumn({ type: 'int', unsigned: true })
	public id: number;

	@ManyToOne(() => AccountEntity, (parent) => parent.children,{nullable:true, onDelete:'SET NULL'})
	public parent?: IAccountEntity;
	
	@OneToMany(()=>GoalEntity, (goal)=>goal.child)
	public goals:IGoalEntity[];

	@OneToOne(() => PersonEntity, { nullable: false, onDelete: 'CASCADE' })
	@JoinColumn()
	public person: IPersonEntity;
	
	@ManyToMany(()=>AccountEntity,(account)=>account.teaches)
	public teachers:IAccountEntity[];
}

export class UpdateChild extends PartialType(CreateChild) { }