import { PartialType } from "@nestjs/mapped-types";
import { ArrayMaxSize, IsArray, IsInt, IsMobilePhone, IsNumber, IsOptional, IsPhoneNumber, IsPositive, IsString, MaxLength, NotContains, Validate, ValidateNested, validate } from "class-validator";
import { AccountEntity } from "../account/account.entity";
import { Type } from "class-transformer";
import { ChildEntity } from "../child/child.entity";
import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { IAccountEntity, IChildEntity, ICreateParent, IParentEntity } from "../../../../interfaces.d";

export class CreateParent {//implements ICreateParent{
	@IsString() @IsOptional() @MaxLength(64)
	@Column({ type: 'nvarchar', length: 64, nullable: true })
	public address?: string;

	@IsNumber() @IsInt() @IsPositive()
	@Column({ type: 'int', unsigned: true, unique: true, nullable: false })//todo check if all entities with accountId are "unique"
	public accountId: number;

	@IsOptional() @IsString() @MaxLength(15)
	@IsPhoneNumber("YE")
	@NotContains(' ')
	@Column({type:'varchar',nullable:true,length:15,})
	public phone0: string;
	
	@IsOptional() @IsString() @MaxLength(15)
	@IsPhoneNumber("YE")
	@NotContains(' ')
	@Column({type:'varchar',nullable:true,length:15,})
	public phone1: string;
	
	@IsOptional() @IsString() @MaxLength(15)
	@IsPhoneNumber("YE")
	@NotContains(' ')
	@Column({type:'varchar',nullable:true,length:15,})
	public phone2: string;
	
	@IsOptional() @IsString() @MaxLength(15)
	@IsPhoneNumber("YE")
	@NotContains(' ')
	@Column({type:'varchar',nullable:true,length:15,})
	public phone3: string;
	
	@IsOptional() @IsString() @MaxLength(15)
	@IsPhoneNumber("YE")
	@NotContains(' ')
	@Column({type:'varchar',nullable:true,length:15,})
	public phone4: string;
	
	@IsOptional() @IsString() @MaxLength(15)
	@IsPhoneNumber("YE")
	@NotContains(' ')
	@Column({type:'varchar',nullable:true,length:15,})
	public phone5: string;
	
	@IsOptional() @IsString() @MaxLength(15)
	@IsPhoneNumber("YE")
	@NotContains(' ')
	@Column({type:'varchar',nullable:true,length:15,})
	public phone6: string;
	
	@IsOptional() @IsString() @MaxLength(15)
	@IsPhoneNumber("YE")
	@NotContains(' ')
	@Column({type:'varchar',nullable:true,length:15,})
	public phone7: string;
	
	@IsOptional() @IsString() @MaxLength(15)
	@IsPhoneNumber("YE")
	@NotContains(' ')
	@Column({type:'varchar',nullable:true,length:15,})
	public phone8: string;
	
	@IsOptional() @IsString() @MaxLength(15)
	@IsPhoneNumber("YE")
	@NotContains(' ')
	@Column({type:'varchar',nullable:true,length:15,})
	public phone9: string;
}

@Entity()
export class ParentEntity extends CreateParent {// implements IParentEntity {
	@PrimaryGeneratedColumn({ type: 'int', unsigned: true })
	public id: number;

	@OneToOne(() => AccountEntity, { onDelete: 'CASCADE', nullable: false })
	@JoinColumn()
	public account: IAccountEntity;

	@OneToMany(() => ChildEntity, (child) => child.parent)
	children: IChildEntity[];
}

export class UpdateParent extends PartialType(CreateParent) {
}
