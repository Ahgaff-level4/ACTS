import { PartialType } from "@nestjs/mapped-types";
import { IsInt, IsNumber, IsPositive } from "class-validator";
import { AccountEntity } from "../account/account.entity";
import { Column, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { IAccountEntity, ICreateHd, IHdEntity } from "../../../../interfaces";

export class CreateHd implements ICreateHd{
	@IsNumber() @IsInt() @IsPositive()
	@Column({type:'int',unsigned:true,unique:true,nullable:false})
	public accountId:number;
}

export class HdEntity extends CreateHd implements IHdEntity{
	@PrimaryGeneratedColumn({type:'int',unsigned:true})
	public id:number;
	
	@OneToOne(()=>AccountEntity,{onDelete:'CASCADE',nullable:false})
	@JoinColumn()
	public account:IAccountEntity;
}

export class UpdateHd extends PartialType(CreateHd){
}
