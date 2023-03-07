import { PartialType } from "@nestjs/mapped-types";
import { IsArray, IsEnum, IsInt, IsLowercase, IsNumber, IsOptional, IsPhoneNumber, IsPositive, IsString, Length, MaxLength, NotContains } from "class-validator";
import { PersonEntity } from "../person/person.entity";
import { IAccountEntity, IChildEntity, ICreateAccount, IEvaluationEntity, IGoalEntity, IPersonEntity, IRoleEntity, Role } from './../../../../interfaces.d';
import { Transform } from "class-transformer";
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, OneToMany, OneToOne, PrimaryGeneratedColumn, ViewEntity } from "typeorm";
import { RoleEntity } from "./role/role.entity";
import { ChildEntity } from "../child/child.entity";
import { EvaluationEntity } from "../evaluation/evaluation.entity";
import { GoalEntity } from "../goal/Goal.entity";

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

	@IsOptional() @IsString() @MaxLength(15)
	@IsPhoneNumber("YE") @NotContains(' ')
	@Column({ type: 'varchar', nullable: true, length: 15, })
	public phone0: string;//!Parent

	@IsOptional() @IsString() @MaxLength(15)
	@IsPhoneNumber("YE") @NotContains(' ')
	@Column({ type: 'varchar', nullable: true, length: 15, })
	public phone1: string;//!Parent

	@IsOptional() @IsString() @MaxLength(15)
	@IsPhoneNumber("YE") @NotContains(' ')
	@Column({ type: 'varchar', nullable: true, length: 15, })
	public phone2: string;//!Parent

	@IsOptional() @IsString() @MaxLength(15)
	@IsPhoneNumber("YE") @NotContains(' ')
	@Column({ type: 'varchar', nullable: true, length: 15, })
	public phone3: string;//!Parent

	@IsOptional() @IsString() @MaxLength(15)
	@IsPhoneNumber("YE") @NotContains(' ')
	@Column({ type: 'varchar', nullable: true, length: 15, })
	public phone4: string;//!Parent

	@IsOptional() @IsString() @MaxLength(15)
	@IsPhoneNumber("YE") @NotContains(' ')
	@Column({ type: 'varchar', nullable: true, length: 15, })
	public phone5: string;//!Parent

	@IsOptional() @IsString() @MaxLength(15)
	@IsPhoneNumber("YE") @NotContains(' ')
	@Column({ type: 'varchar', nullable: true, length: 15, })
	public phone6: string;//!Parent

	@IsOptional() @IsString() @MaxLength(15)
	@IsPhoneNumber("YE") @NotContains(' ')
	@Column({ type: 'varchar', nullable: true, length: 15, })
	public phone7: string;//!Parent

	@IsOptional() @IsString() @MaxLength(15)
	@IsPhoneNumber("YE") @NotContains(' ')
	@Column({ type: 'varchar', nullable: true, length: 15, })
	public phone8: string;//!Parent

	@IsOptional() @IsString() @MaxLength(15)
	@IsPhoneNumber("YE") @NotContains(' ')
	@Column({ type: 'varchar', nullable: true, length: 15, })
	public phone9: string;//!Parent

	@IsArray()
	@IsEnum({ "Admin": "Admin", "HeadOfDepartment": "HeadOfDepartment", "Teacher": "Teacher", "Parent": "Parent" }, { each: true })
	public roles: Role[];//!Account. Derived from `rolesEntities` property
}


@Entity()
export class AccountEntity extends CreateAccount implements IAccountEntity {
	@PrimaryGeneratedColumn({ type: 'int', unsigned: true })
	public id: number;//!Account

	@OneToOne(() => PersonEntity, { nullable: false, onDelete: 'CASCADE' })
	@JoinColumn()
	public person: IPersonEntity;//!Account

	@ManyToMany(() => RoleEntity, (role) => role.accounts)
	@JoinTable()
	public rolesEntities: IRoleEntity[];//!All roles

	@OneToMany(() => ChildEntity, (child) => child.parent)
	public children: IChildEntity[];//!Parent

	@OneToMany(() => EvaluationEntity, (evaluation) => evaluation.teacher)
	public evaluations: IEvaluationEntity[];//!Teacher

	@OneToMany(() => GoalEntity, (goal) => goal.teacher)
	public goals: IGoalEntity[];//!Teacher

	//todo many-to-many with children. //!Teacher
}

export class UpdateAccountOldPassword extends PartialType(CreateAccount) {
	@IsString()
	oldPassword: string;
}

export class UpdateAccount extends PartialType(CreateAccount) {
}

// @ViewEntity({
// 	expression: (connection) => connection.createQueryBuilder()
// 		.select('account.id', 'id')
// 		.addSelect('account.username', 'username')
// 		.addSelect('account.password', 'password')
// 		.addSelect('account.personId', 'personId')
// 		.addSelect('account.address', 'address')
// 		.addSelect('account.phone0', 'phone0')
// 		.addSelect('account.phone1', 'phone1')
// 		.addSelect('account.phone2', 'phone2')
// 		.addSelect('account.phone3', 'phone3')
// 		.addSelect('account.phone4', 'phone4')
// 		.addSelect('account.phone5', 'phone5')
// 		.addSelect('account.phone6', 'phone6')
// 		.addSelect('account.phone7', 'phone7')
// 		.addSelect('account.phone8', 'phone8')
// 		.addSelect('account.phone9', 'phone9')
// 		.from(AccountEntity, 'account')
// 	// .leftJoinAndMapMany('account.roles',RoleEntity,'role',)//if not working ad in roles property
// })
// export class AccountView extends AccountEntity {
// }

