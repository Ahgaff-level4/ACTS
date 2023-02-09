import { PartialType } from "@nestjs/mapped-types";
import { IsNumber } from "class-validator";
import { AccountEntity } from "../account/account.entity";

export class CreateTeacher{
	@IsNumber()
	accountId!:number;
}
export class TeacherEntity extends CreateTeacher {
	id:number;
	account:AccountEntity;
}

export class UpdateTeacher extends PartialType(CreateTeacher){
}
