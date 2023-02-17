import { PartialType } from "@nestjs/mapped-types";
import { IsDateString, IsEnum, IsNumber, IsOptional, IsString } from "class-validator";
import { PerformanceEntity } from "../performance/performance.entity";
import { ChildEntity } from "../child/child.entity";

export class CreateGoal {
	@IsString() @IsOptional()
	note?: string;
	@IsDateString() @IsOptional()
	assignDatetime?: Date | string;
	@IsEnum({ "continuous": "continuous", "strength": "strength", "completed": "completed" }
	,{message:`state must be a valid enum value. Enum values are (continuous, strength, completed)`})
	state!: 'continuous' | "strength" | "completed";
	@IsNumber()
	performanceId!:number;
	@IsNumber()
	childId!:number;
}
export class GoalEntity extends CreateGoal {
	id: number;
	performance:PerformanceEntity;
	child:ChildEntity;
}

export class UpdateGoal extends PartialType(CreateGoal) {
}
