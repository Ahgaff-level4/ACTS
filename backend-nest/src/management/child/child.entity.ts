import { PartialType } from "@nestjs/mapped-types";
import { IsNumber, IsOptional, IsDateString, IsString, Length, MaxLength, IsDate, MinDate, MaxDate, IsInt, IsPositive, IsBoolean } from "class-validator";
import { PersonEntity, PersonView } from "../person/person.entity";
import { ParentEntity } from "../parent/parent.entity";
import { IChildEntity, ICreateChild, IGoalEntity, IParentEntity, IPersonEntity } from './../../../../interfaces.d'
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, ViewColumn, ViewEntity } from "typeorm";
import { Type } from "class-transformer";
import { GoalEntity } from "../goal/Goal.entity";
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
	//todo many-to-many with Teacher
}

@Entity()
export class ChildEntity extends CreateChild {
	@ViewColumn()
	@PrimaryGeneratedColumn({ type: 'int', unsigned: true })
	public id: number;

	@ManyToOne(() => ParentEntity, (parent) => parent.children,{nullable:true, onDelete:'SET NULL'})
	public parent?: IParentEntity;
	
	@OneToMany(()=>GoalEntity, (goal)=>goal.child)
	public goals:IGoalEntity[];

	@OneToOne(() => PersonEntity, { nullable: false, onDelete: 'CASCADE' })
	@JoinColumn()
	public person: IPersonEntity;
}

export class UpdateChild extends PartialType(CreateChild) { }


@ViewEntity({
	expression: (connection) => connection.createQueryBuilder()
		.select('child.id', 'id')
		.addSelect('child.femaleFamilyMembers', 'femaleFamilyMembers')
		.addSelect('child.maleFamilyMembers', 'maleFamilyMembers')
		.addSelect('child.birthOrder', 'birthOrder')
		.addSelect('child.parentsKinship', 'parentsKinship')
		.addSelect('child.diagnosticDate', 'diagnosticDate')
		.addSelect('child.pregnancyState', 'pregnancyState')
		.addSelect('child.birthState', 'birthState')
		.addSelect('child.growthState', 'growthState')
		.addSelect('child.diagnostic', 'diagnostic')
		.addSelect('child.medicine', 'medicine')
		.addSelect('child.behaviors', 'behaviors')
		.addSelect('child.prioritySkills', 'prioritySkills')
		.addSelect('child.isArchive', 'isArchive')
		.addSelect('child.parentId', 'parentId')
		.addSelect('child.personId', 'personId')
		.addSelect('(child.femaleFamilyMembers + child.maleFamilyMembers)', 'familyMembers')
		// .addSelect('person.createdDatetime', 'registerDate')//todo fix durationSpent
		.addSelect('TIMESTAMPDIFF(minute,person.createdDatetime,CURDATE())', 'durationSpent')
		.from(ChildEntity, 'child')
		.leftJoinAndMapOne('child.person',PersonView,'person','child.personId=person.id')
		// .leftJoin(ParentEntity,'parent')
})
export class ChildView extends ChildEntity implements IChildEntity {
	@ViewColumn()
	public familyMembers?: number;

	@ViewColumn()
	public durationSpent: number;

	/** registerDate is person.createdDatetime */
	@ViewColumn()
	public registerDate: Date;
}