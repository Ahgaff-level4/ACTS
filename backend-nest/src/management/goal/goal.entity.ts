import { PartialType } from "@nestjs/mapped-types";
import { IsDate, IsEnum, IsInt, IsNumber, IsOptional, IsPositive, IsString, MaxLength } from "class-validator";
import { ActivityEntity } from "../activity/activity.entity";
import { GoalState, IAccountEntity, IActivityEntity, IChildEntity, ICreateGoal, IEvaluationEntity, IGoalEntity } from "../../../../interfaces.d";
import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { EvaluationEntity } from "../evaluation/evaluation.entity";
import { Type } from "class-transformer";
import { ChildEntity } from "../child/child.entity";
import { AccountEntity } from "../account/account.entity";

export class CreateGoal implements ICreateGoal {
	@IsString() @IsOptional() @MaxLength(512)
	@Column({ type: 'nvarchar', nullable: true, length: 512 })
	public note?: string;

	@Type(() => Date) @IsDate() @IsOptional()
	@CreateDateColumn({ type: 'datetime' })
	public assignDatetime?: Date;

	@IsEnum({ "continual": "continual", "strength": "strength", "completed": "completed" }
		, { message: `state must be a valid enum value. Enum values are (continual, strength, completed)` })
	@Column({ type: 'enum', enum: ["continual", "strength", "completed"], nullable: false })
	public state: GoalState;

	@IsNumber() @IsInt() @IsPositive()
	@Column({ type: 'int', unsigned: true, nullable: false, unique: false })
	public activityId: number;

	@IsNumber() @IsInt() @IsPositive()
	@Column({ type: 'int', unsigned: true, nullable: false, unique: false })
	public childId: number;

	@IsNumber() @IsInt() @IsPositive()
	@Column({ type: 'int', unsigned: true, nullable: false, unique: false })
	public teacherId: number;
}

@Entity()
export class GoalEntity extends CreateGoal implements IGoalEntity {
	@PrimaryGeneratedColumn({ type: 'int', unsigned: true })
	public id: number;

	@ManyToOne(() => ActivityEntity, (activity) => activity.goals, { onDelete: 'NO ACTION', nullable: false })
	public activity: IActivityEntity;

	@ManyToOne(() => ChildEntity, (child) => child.goals, { onDelete: 'CASCADE', nullable: false })
	public child: IChildEntity;

	@OneToMany(() => EvaluationEntity, (evaluation) => evaluation.goal)
	public evaluations: IEvaluationEntity[];

	@ManyToOne(() => AccountEntity, (teacher) => teacher.goals, { onDelete: 'NO ACTION', nullable: false })
	public teacher: IAccountEntity;
}

export class UpdateGoal extends PartialType(CreateGoal) {
}
