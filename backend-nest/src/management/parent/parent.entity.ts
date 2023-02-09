import { PartialType } from "@nestjs/mapped-types";
import { ArrayMaxSize, IsArray, IsNumber, IsOptional, IsString, Validate, ValidateNested, validate } from "class-validator";
import { AccountEntity } from "../account/account.entity";
import { Type } from "class-transformer";

export class CreateParent{
	@IsOptional()
	@IsArray()
	@ArrayMaxSize(10)
	@IsString({each:true})
	phone:number[];
	@IsString() @IsOptional()
	address?:string;
	@IsNumber()
	accountId!:number;
}
export class ParentEntity extends CreateParent {
	id:number;
	account:AccountEntity;
}

export class UpdateParent extends PartialType(CreateParent){
}