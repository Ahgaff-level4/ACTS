import { PartialType } from "@nestjs/mapped-types";
import { IsInt, IsLowercase, IsNumber, IsPositive, IsString, Length, NotContains } from "class-validator";
import { PersonEntity } from "../person/person.entity";
import { IAccountEntity, ICreateAccount } from './../../../../interfaces.d';
import { Transform } from "class-transformer";
import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, ViewColumn, ViewEntity } from "typeorm";

export class CreateAccount implements ICreateAccount {
	@IsString() @NotContains(' ')
	@Length(4, 32) @IsLowercase()
	@Transform(({ value }) => (value as string).toString().toLowerCase())
	@ViewColumn()
	@Column({ length: 32, unique: true, nullable: false })
	public username: string;

	@IsString()
	@Length(4)
	@ViewColumn()
	@Column({ length: 60, type: 'char', unique: false, nullable: false })
	public password: string;

	//'create' should provide 'personId'. You can insert or update person by assigning person property
	@IsInt() @IsNumber() @IsPositive() 
	@ViewColumn()
	@Column({ type: 'int', unsigned: true, unique: true, nullable: false })
	public personId: number;
}

@Entity()
export class AccountEntity extends CreateAccount implements IAccountEntity {
	@ViewColumn()
	@PrimaryGeneratedColumn({ type: 'int', unsigned: true })
	public id: number;

	@OneToOne(() => PersonEntity, { nullable: false, onDelete: 'CASCADE'})
	@JoinColumn()
	public person: PersonEntity;
}

export class UpdateAccountOldPassword extends PartialType(CreateAccount) {
	@IsString()
	oldPassword: string;
}

export class UpdateAccount extends PartialType(CreateAccount) {
}

@ViewEntity({
	expression: (connection) => connection.createQueryBuilder()
		.select('account.id', 'id')
		.addSelect('account.username', 'username')
		.addSelect('account.personId', 'personId')
		.from(AccountEntity, 'account')
})
/** hide password property */
export class AccountView {
	@ViewColumn()
	public id: number;
	
	@ViewColumn()
	public username: string;

	@ViewColumn()
	public personId: number;
}

