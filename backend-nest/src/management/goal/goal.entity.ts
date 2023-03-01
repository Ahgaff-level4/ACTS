import { PartialType } from "@nestjs/mapped-types";
import { IsDate, IsDateString, IsEnum, IsInt, IsNumber, IsOptional, IsPositive, IsString, MaxLength } from "class-validator";
import { ActivityEntity } from "../activity/activity.entity";
import { GoalState, IActivityEntity, IChildEntity, ICreateGoal, IEvaluationEntity, IGoalEntity, ITeacherEntity } from "../../../../interfaces";
import { Column, CreateDateColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { EvaluationEntity } from "../evaluation/evaluation.entity";
import { TeacherEntity } from "../teacher/teacher.entity";
import { Type } from "class-transformer";
import { ChildEntity } from "../child/child.entity";

export class CreateGoal implements ICreateGoal {
	@IsString() @IsOptional() @MaxLength(512)
	@Column({type:'nvarchar',nullable:true,length:512})
	public note?: string;
	
	@Type(()=>Date) @IsDate() @IsOptional()
	@CreateDateColumn({type:'datetime'})
	public assignDatetime?: Date;
	
	@IsEnum({ "continual": "continual", "strength": "strength", "completed": "completed" }
	,{message:`state must be a valid enum value. Enum values are (continual, strength, completed)`})
	public state: GoalState;//todo column with enum type
	
	@IsNumber() @IsInt() @IsPositive()
	@Column({type:'int',unsigned:true,nullable:false,unique:false})
	public activityId:number;
	
	@IsNumber() @IsInt() @IsPositive()
	@Column({type:'int',unsigned:true,nullable:false,unique:false})
	public childId:number;
	
	@IsNumber() @IsInt() @IsPositive()
	@Column({type:'int',unsigned:true,nullable:false,unique:false})
	public teacherId:number;
}

export class GoalEntity extends CreateGoal implements IGoalEntity {
	@PrimaryGeneratedColumn({type:'int',unsigned:true})
	public id: number;
	
	@ManyToOne(()=>ActivityEntity,(activity)=>activity.goals,{onDelete:'NO ACTION',nullable:false})
	public activity:IActivityEntity;
	
	@ManyToOne(()=>ChildEntity,(child)=>child.goals,{onDelete:'CASCADE',nullable:false})
	public child:IChildEntity;
	
	@OneToMany(()=>EvaluationEntity, (evaluation)=>evaluation.goal)
	public evaluations:IEvaluationEntity[];
	
	@ManyToOne(()=>TeacherEntity,(teacher)=>teacher.goals,{onDelete:'NO ACTION',nullable:false})
	public teacher:ITeacherEntity;
}

export class UpdateGoal extends PartialType(CreateGoal) {
}
