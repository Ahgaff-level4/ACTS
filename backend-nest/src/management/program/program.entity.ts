import { PartialType } from "@nestjs/mapped-types";
import { IsDate, IsOptional, IsString, MaxLength } from "class-validator";
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, ViewColumn, ViewEntity } from "typeorm";
import { IActivityEntity, ICreateProgram, IProgramEntity } from "../../../../interfaces.d";
import { Type } from "class-transformer";
import { ActivityEntity } from "../activity/activity.entity";

export class CreateProgram implements ICreateProgram {
    @IsString() @MaxLength(50)
    @ViewColumn()
    @Column({type:'nvarchar',unique:true,length:50,nullable:false})
    public name: string;
    
    @Type(()=>Date) @IsDate() @IsOptional()
    @ViewColumn()
    @CreateDateColumn({type:'datetime'})
    public createdDatetime?: Date;
}

@Entity()
export class ProgramEntity extends CreateProgram {
    @ViewColumn()
    @PrimaryGeneratedColumn({type:'int',unsigned:true})
    public id: number;
    
    @OneToMany(() => ActivityEntity, (activity) => activity.program)
    public activities: IActivityEntity[];
}

export class UpdateProgram extends PartialType(CreateProgram) { }
