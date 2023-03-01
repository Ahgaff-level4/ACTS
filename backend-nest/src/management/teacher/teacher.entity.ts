import { PartialType } from "@nestjs/mapped-types";
import { IsInt, IsNumber, IsPositive } from "class-validator";
import { AccountEntity } from "../account/account.entity";
import { IAccountEntity, ICreateTeacher, IEvaluationEntity, IGoalEntity, ITeacherEntity } from "../../../../interfaces";
import { Column, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { EvaluationEntity } from "../evaluation/evaluation.entity";
import { GoalEntity } from "../goal/Goal.entity";

export class CreateTeacher implements ICreateTeacher {
	@IsNumber() @IsInt() @IsPositive()
	@Column({ type: 'int', unsigned: true, nullable: false, unique: true })
	public accountId: number;
}

export class TeacherEntity extends CreateTeacher implements ITeacherEntity {
	@PrimaryGeneratedColumn({ type: 'int', unsigned: true })
	public id: number;

	@OneToOne(() => AccountEntity,{onDelete:'CASCADE',nullable:false})
	@JoinColumn()
	public account: IAccountEntity;

	@OneToMany(() => EvaluationEntity, (evaluation) => evaluation.teacher)
	public evaluations: IEvaluationEntity[];

	@OneToMany(() => GoalEntity, (goal) => goal.teacher)
	public goals: IGoalEntity[];
}

export class UpdateTeacher extends PartialType(CreateTeacher) {
}
