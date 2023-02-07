import { PartialType } from "@nestjs/mapped-types";
import { IsNumber,IsOptional, IsDate, IsString} from "class-validator";
import { PersonEntity } from "../person/person.entity";
import { ParentEntity } from "../parent/parent.entity";

export class CreateChild {
	@IsNumber() @IsOptional()
	femaleFamilyMembers?:number;
	@IsNumber() @IsOptional()
	maleFamilyMembers?:number;
	@IsNumber() @IsOptional()
	birthOrder?:number;
	@IsString() @IsOptional()
	parentsKinship?:string;
	@IsDate() @IsOptional()
	diagnosticDate?:Date|string;
	@IsString() @IsOptional()
	pregnancyState?:string;
	@IsString() @IsOptional()
	birthState?:string;
	@IsString() @IsOptional()
	growthState?:string;
	@IsString() @IsOptional()
	diagnostic?:string;
	@IsString() @IsOptional()
	medicine?:string;
	@IsString() @IsOptional()
	behaviors?:string;
	@IsString() @IsOptional()
	prioritySkills?:string;
	@IsNumber() @IsOptional()
	parentId?:number;
	@IsNumber()
	personId:number;
}

export class ChildEntity extends CreateChild {
	id: number;
	parent?:ParentEntity;
	person:PersonEntity;
	/**
	 * registerDate is person.createdDatetime
	 */
	registerDate:Date|string;
}

export class UpdateChild extends PartialType(CreateChild) { }
