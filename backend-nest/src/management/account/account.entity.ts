import { PartialType } from "@nestjs/mapped-types";
import { IsInstance, IsInt, IsLowercase, IsNotEmpty, IsNumber, IsObject, IsOptional, IsPositive, IsString, Length, MaxLength, MinLength, ValidateIf, ValidateNested } from "class-validator";
import { CreatePerson, PersonEntity, UpdatePerson } from "../person/person.entity";
import { IAccountEntity, ICreateAccount } from './../../../../interfaces.d';
import { Transform, TransformPlainToInstance, Type } from "class-transformer";
import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, ViewColumn, ViewEntity } from "typeorm";

export class CreateAccount implements ICreateAccount {
	@IsString()
	@Length(4, 32)
	@Transform(({ value }) => (value as string).toLowerCase())
	@IsLowercase()
	@ViewColumn()
	@Column({ length: 32,unique:true,nullable:false })
	public username: string;

	@IsString()
	@Length(4)
	@ViewColumn()
	@Column({ length: 60, type: 'char',unique:false,nullable:false })
	public password: string;

	//'create' should provide 'person object'. You can insert or update person by assigning person property
	@IsObject() @ValidateNested() @Type(()=>CreatePerson)
	@OneToOne(() => PersonEntity, { nullable: false, onDelete: 'CASCADE', cascade: ['insert', 'update'],eager:true })
	@JoinColumn()
	public person: PersonEntity;
}

@Entity()
export class AccountEntity extends CreateAccount implements IAccountEntity {
	@ViewColumn()
	@PrimaryGeneratedColumn({ type: 'int', unsigned: true })
	public id: number;

	@Column({ type: 'int', unsigned: true,unique:true,nullable:false })
	public personId: number;
}

export class UpdateAccountOldPassword extends PartialType(CreateAccount) {
	@IsString()
	oldPassword: string;
}

export class UpdateAccount extends PartialType(CreateAccount) {
}


