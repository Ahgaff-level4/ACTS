import { PartialType } from "@nestjs/mapped-types";
import { IsDateString, IsNumber, IsOptional, IsString } from "class-validator";
import { GoalEntity } from "../goal/Goal.entity";
import { TeacherEntity } from "../teacher/teacher.entity";
import { ICreateEvaluation, IEvaluationEntity } from "../../../../interfaces";

export class CreateEvaluation implements ICreateEvaluation {
	@IsString()
	description!: string;
	@IsString() @IsOptional()
	mainstream?: string;
	@IsString() @IsOptional()
	note?: string;
	@IsDateString() @IsOptional()
	evaluationDatetime:Date|string;
	@IsNumber()
	goalId!:number;
	@IsNumber() @IsOptional()
	teacherId:number;
}
export class EvaluationEntity extends CreateEvaluation implements IEvaluationEntity {
	id: number;
	goal:GoalEntity;
	teacher?:TeacherEntity;
}

export class UpdateEvaluation extends PartialType(CreateEvaluation) {
}
