import { PartialType } from "@nestjs/mapped-types";
import { IsDate, IsDateString, IsEnum, IsInt, IsNumber, IsOptional, IsPositive, IsString, MaxLength } from "class-validator";
import { GoalEntity } from "../goal/Goal.entity";
import { TeacherEntity } from "../teacher/teacher.entity";
import { EvaluationRate, ICreateEvaluation, IEvaluationEntity, IGoalEntity, ITeacherEntity } from "../../../../interfaces";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Type } from "class-transformer";

export class CreateEvaluation implements ICreateEvaluation {
	@IsString() @MaxLength(512)
	@Column({ type: 'nvarchar', length: 512, unique: false, nullable: false })
	public description: string;

	@IsString() @IsOptional() @MaxLength(512)
	@Column({ type: 'nvarchar', length: 512, unique: false, nullable: true })
	public mainstream?: string;

	@IsString() @IsOptional() @MaxLength(512)
	@Column({ type: 'nvarchar', length: 512, unique: false, nullable: true })
	public note?: string;

	@IsEnum({ "continual": "continual", "excellent": "excellent" }
		, { message: `Rate must be a valid enum value. Enum values are (continual, excellent)` })
	//todo column
	public rate: EvaluationRate;

	@IsOptional() @Type(() => Date) @IsDate()
	@CreateDateColumn({ type: 'datetime' })
	public evaluationDatetime: Date;

	@IsNumber() @IsInt() @IsPositive()
	@Column({ type: 'int', unsigned: true, unique: false, nullable: false })
	public goalId: number;

	@IsNumber() @IsInt() @IsPositive()
	@Column({ type: 'int', unsigned: true, unique: false, nullable: false })
	public teacherId: number;
}

@Entity()
export class EvaluationEntity extends CreateEvaluation implements IEvaluationEntity {
	@PrimaryGeneratedColumn({ type: 'int', unsigned: true })
	public id: number;

	@ManyToOne(() => GoalEntity, (goal) => goal.evaluations, { nullable: false, onDelete: 'CASCADE' })
	public goal: IGoalEntity;

	@ManyToOne(() => TeacherEntity, (teacher) => teacher.evaluations, { nullable: false, onDelete: 'NO ACTION' })
	public teacher: ITeacherEntity;
}

export class UpdateEvaluation extends PartialType(CreateEvaluation) {
}
