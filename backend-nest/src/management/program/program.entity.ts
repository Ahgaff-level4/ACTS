import { PartialType } from "@nestjs/mapped-types";
import { IsDate, IsOptional, IsString, MaxLength } from "class-validator";
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { IActivityEntity, IChildEntity, ICreateProgram } from "../../../../interfaces.d";
import { Type } from "class-transformer";
import { ActivityEntity } from "../activity/activity.entity";
import { ChildEntity } from "../child/child.entity";

export class CreateProgram implements ICreateProgram {
    @IsString() @MaxLength(50)
    @Column({ type: 'nvarchar', unique: true, length: 50, nullable: false })
    public name: string;

    @Type(() => Date) @IsDate() @IsOptional()
    @CreateDateColumn({ type: 'datetime' })
    public createdDatetime?: Date;
}

@Entity()
export class ProgramEntity extends CreateProgram {
    @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
    public id: number;

    @OneToMany(() => ActivityEntity, (activity) => activity.program)
    public activities: IActivityEntity[];

    @OneToMany(() => ChildEntity, child => child.program)
    public children: IChildEntity[];
}

export class UpdateProgram extends PartialType(CreateProgram) { }
