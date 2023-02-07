import { PartialType } from "@nestjs/mapped-types";
import { IsArray, IsNumber, IsOptional, IsString, Validate, validate } from "class-validator";
import { AccountEntity } from "../account/account.entity";

export class CreateParent{
	@Validate((v:number[])=>v && typeof v.length == 'number'&& v.length <= 10)
	phone:number[];
	@IsString() @IsOptional()
	address?:string;
	@IsNumber()
	accountId:number;
}
export class ParentEntity extends CreateParent {
	id:number;
	account:AccountEntity;
}

export class UpdateParent extends PartialType(CreateParent){
}
