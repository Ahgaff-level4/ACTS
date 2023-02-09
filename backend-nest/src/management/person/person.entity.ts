import { PartialType } from "@nestjs/mapped-types";
import { IsBoolean, IsDateString, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreatePerson{
	@IsString()
	name:string;
	@IsDateString() @IsOptional()
	birthDate?:Date|string;
	@IsBoolean()
	isMale:boolean|0|1;
	@IsDateString() @IsOptional()
	createdDatetime:Date|string;
}

export class PersonEntity extends CreatePerson {
    id:number;
    age?:number;
}

export class UpdatePerson extends PartialType(CreatePerson){}