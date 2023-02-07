import { PartialType } from "@nestjs/mapped-types";
import { IsNumber,IsString} from "class-validator";
import { PersonEntity } from "../person/person.entity";

export class CreateAccount {
	@IsString()
	username:string;
	@IsString()
	password:string;
	@IsNumber()
	personId:number;
}

export class AccountEntity extends CreateAccount {
	id: number;
	person:PersonEntity;
}

export class UpdateAccount extends PartialType(CreateAccount) { }
