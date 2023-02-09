import { PartialType } from "@nestjs/mapped-types";
import { IsDateString, IsEnum, IsNumber, IsOptional, IsString } from "class-validator";
import { PerformanceEntity } from "../performance/performance.entity";
import { ChildEntity } from "../child/child.entity";
import { GoalEntity } from "../goal/Goal.entity";
import { TeacherEntity } from "../teacher/teacher.entity";

export class CreateEvaluation {
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
export class EvaluationEntity extends CreateEvaluation {
	id: number;
	goal:GoalEntity;
	teacher?:TeacherEntity;
}

export class UpdateEvaluation extends PartialType(CreateEvaluation) {
}
