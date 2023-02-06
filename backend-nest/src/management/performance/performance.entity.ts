import { PartialType } from "@nestjs/mapped-types";
import { FieldEntity } from "../field/field.entity";
import { ProgramEntity } from "../program/program.entity";
import { IsNotEmpty, IsNumber,IsDateString, IsOptional} from "class-validator";

export class CreatePerformance {
	@IsNotEmpty()
	name: string;
	@IsNumber() @IsOptional()
	minAge?: number;
	@IsNumber() @IsOptional()
	maxAge?: number;
	@IsNumber() @IsOptional()
	fieldId?: number;
	@IsNumber() @IsOptional()
	programId?: number;
	@IsDateString() @IsOptional()
	createdDatetime?: string;
}

export class PerformanceEntity extends CreatePerformance {
	id: number;
	program?: ProgramEntity;
	field?: FieldEntity;
}

export class UpdatePerformance extends PartialType(CreatePerformance) { }
