import { PartialType } from "@nestjs/mapped-types";
import { IsNumber } from "class-validator";
import { AccountEntity } from "../account/account.entity";

export class CreateHd{
	@IsNumber()
	accountId!:number;
}
export class HdEntity extends CreateHd {
	id:number;
	account:AccountEntity;
}

export class UpdateHd extends PartialType(CreateHd){
}
