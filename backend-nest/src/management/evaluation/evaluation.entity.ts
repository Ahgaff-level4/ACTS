import { PartialType } from "@nestjs/mapped-types";
import { IsDate, IsEnum, IsInt, IsNumber, IsOptional, IsPositive, IsString, MaxLength } from "class-validator";
import { GoalEntity } from "../goal/Goal.entity";
import { EvaluationRate, IAccountEntity, ICreateEvaluation, IEvaluationEntity, IGoalEntity } from "../../../../interfaces.d";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Type } from "class-transformer";
import { AccountEntity } from "../account/account.entity";

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
	@Column({type:'enum',enum:["continual","excellent"],nullable:false})
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

	@ManyToOne(() => AccountEntity, (teacher) => teacher.evaluations, { nullable: false, onDelete: 'NO ACTION' })
	public teacher: IAccountEntity;
}

export class UpdateEvaluation extends PartialType(CreateEvaluation) {
}
