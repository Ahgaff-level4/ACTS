import { PartialType } from "@nestjs/mapped-types";
import { IsNumber, IsString } from "class-validator";
import { PersonEntity } from "../person/person.entity";
import {IAccountEntity, ICreateAccount} from './../../../../interfaces.d';

export class CreateAccount implements ICreateAccount {
	@IsString()
	username: string;
	@IsString()
	password: string;
	@IsNumber()
	personId: number;
}

export class AccountEntity extends CreateAccount implements IAccountEntity {
	id: number;
	person: PersonEntity;
}

export class UpdateAccountOldPassword extends PartialType(CreateAccount) {
	@IsString()
	oldPassword:string;
}

export class UpdateAccount extends PartialType(CreateAccount) {
}
