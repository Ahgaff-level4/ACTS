import { PartialType, PickType } from "@nestjs/mapped-types";
import { IsArray, IsEnum, IsInt, IsLowercase, IsNumber, IsObject, IsOptional, IsPositive, IsString, Length, MaxLength, NotContains } from "class-validator";
import { PersonEntity } from "../person/person.entity";
import { IAccountEntity, IChangePassword, IChildEntity, ICreateAccount, IEvaluationEntity, IGoalEntity, IPersonEntity, IRoleEntity, Role } from '../../../../interfaces';
import { Transform } from "class-transformer";
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { RoleEntity } from "./role/role.entity";
import { ChildEntity } from "../child/child.entity";
import { EvaluationEntity } from "../evaluation/evaluation.entity";
import { GoalEntity } from "../goal/goal.entity";

export class CreateAccount implements ICreateAccount {
	@IsString() @NotContains(' ') @Length(4, 32) @IsLowercase()
	@Transform(({ value }) => (value as string).toString().toLowerCase())
	@Column({ length: 32, unique: true, nullable: false })
	public username: string;//!Account

	@IsString() @Length(4)
	@Column({ length: 60, type: 'char', unique: false, nullable: false })
	public password: string;//!Account

	//'create' should provide 'personId'. You can insert or update person by assigning person property
	@IsInt() @IsNumber() @IsPositive()
	@Column({ type: 'int', unsigned: true, unique: true, nullable: false })
	public personId: number;//!Account

	@IsString() @IsOptional() @MaxLength(64)
	@Column({ type: 'nvarchar', length: 64, nullable: true })
	public address?: string;//!Parent

	@IsOptional() @IsString() @MaxLength(15) @NotContains(' ')
	@Column({ type: 'varchar', nullable: true, length: 15, })
	public phone0: string;//!Parent

	@IsOptional() @IsString() @MaxLength(15) @NotContains(' ')
	@Column({ type: 'varchar', nullable: true, length: 15, })
	public phone1: string;//!Parent

	@IsOptional() @IsString() @MaxLength(15) @NotContains(' ')
	@Column({ type: 'varchar', nullable: true, length: 15, })
	public phone2: string;//!Parent

	@IsOptional() @IsString() @MaxLength(15) @NotContains(' ')
	@Column({ type: 'varchar', nullable: true, length: 15, })
	public phone3: string;//!Parent

	@IsOptional() @IsString() @MaxLength(15) @NotContains(' ')
	@Column({ type: 'varchar', nullable: true, length: 15, })
	public phone4: string;//!Parent

	@IsOptional() @IsString() @MaxLength(15) @NotContains(' ')
	@Column({ type: 'varchar', nullable: true, length: 15, })
	public phone5: string;//!Parent

	@IsOptional() @IsString() @MaxLength(15) @NotContains(' ')
	@Column({ type: 'varchar', nullable: true, length: 15, })
	public phone6: string;//!Parent

	@IsOptional() @IsString() @MaxLength(15) @NotContains(' ')
	@Column({ type: 'varchar', nullable: true, length: 15, })
	public phone7: string;//!Parent

	@IsOptional() @IsString() @MaxLength(15) @NotContains(' ')
	@Column({ type: 'varchar', nullable: true, length: 15, })
	public phone8: string;//!Parent

	@IsOptional() @IsString() @MaxLength(15) @NotContains(' ')
	@Column({ type: 'varchar', nullable: true, length: 15, })
	public phone9: string;//!Parent

	@IsArray()
	@IsEnum({ "Admin": "Admin", "HeadOfDepartment": "HeadOfDepartment", "Teacher": "Teacher", "Parent": "Parent" }, { each: true })
	public roles: Role[];//!Account. Derived from `rolesEntities` property

	@IsOptional() @IsArray() @IsObject({ each: true })
	@OneToMany(() => ChildEntity, (child) => child.parent, { onDelete: 'SET NULL', nullable: true })
	public children: IChildEntity[];//!Parent

	@IsOptional() @IsArray() @IsObject({ each: true })
	@ManyToMany(() => ChildEntity, (child) => child.teachers, { onDelete: 'CASCADE' })
	@JoinTable()
	public teaches: IChildEntity[];//!Teacher
}


@Entity()
export class AccountEntity extends CreateAccount implements IAccountEntity {
	@PrimaryGeneratedColumn({ type: 'int', unsigned: true })
	public id: number;//!Account

	@OneToOne(() => PersonEntity, { nullable: false, onDelete: 'CASCADE' })
	@JoinColumn()
	public person: IPersonEntity;//!Account

	@ManyToMany(() => RoleEntity, (role) => role.accounts, { onDelete: "CASCADE" })
	@JoinTable()
	public rolesEntities: IRoleEntity[];//!All roles

	@OneToMany(() => EvaluationEntity, (evaluation) => evaluation.teacher)
	public evaluations: IEvaluationEntity[];//!Teacher

	@OneToMany(() => GoalEntity, (goal) => goal.teacher)
	public goals: IGoalEntity[];//!Teacher
}

export class ChangePassword extends PickType(CreateAccount, ['password']) implements IChangePassword {
	@IsString()
	oldPassword: string;
}

export class UpdateAccount extends PartialType(AccountEntity) {
}
