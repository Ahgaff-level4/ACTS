import { PartialType } from "@nestjs/mapped-types";
import { ArrayMaxSize, IsArray, IsInt, IsNumber, IsOptional, IsPhoneNumber, IsPositive, IsString, MaxLength, Validate, ValidateNested, validate } from "class-validator";
import { AccountEntity } from "../account/account.entity";
import { Type } from "class-transformer";
import { ChildEntity } from "../child/child.entity";
import { Column, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { IAccountEntity, IChildEntity, ICreateParent, IParentEntity } from "../../../../interfaces";

export class CreateParent implements ICreateParent{
	@IsOptional()
	@IsArray()
	@ArrayMaxSize(10)
	@IsString({each:true})
	@MaxLength(15,{each:true})
	@IsPhoneNumber("YE",{each:true})//todo check IsPhoneNumber or try IsMobileNumber
	public phone:string[];//todo how to save array values in db OR just use phone0, phone1...
	
	@IsString() @IsOptional() @MaxLength(64)
	@Column({type:'nvarchar',length:64,nullable:true})
	public address?:string;
	
	@IsNumber() @IsInt() @IsPositive()
	@Column({type:'int',unsigned:true,unique:true,nullable:false})//todo check if all entities with accountId are "unique"
	public accountId:number;
}
export class ParentEntity extends CreateParent implements IParentEntity {
	@PrimaryGeneratedColumn({type:'int',unsigned:true})
	public id:number;
	
	@OneToOne(()=>AccountEntity,{onDelete:'CASCADE',nullable:false})
	@JoinColumn()
	public account:IAccountEntity;
	
	@OneToMany(()=>ChildEntity,(child)=>child.parent)
	children:IChildEntity[];
}

export class UpdateParent extends PartialType(CreateParent){
}
