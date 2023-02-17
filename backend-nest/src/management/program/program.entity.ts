import { PartialType } from "@nestjs/mapped-types";
import { IsDateString, IsNotEmpty, IsOptional } from "class-validator";
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

export class CreateProgram {
    @IsNotEmpty()
    name: string;
    @IsDateString() @IsOptional()
    createdDatetime?: Date | string;
}

export class ProgramEntity extends CreateProgram {
    id: number;
}

export class UpdateProgram extends PartialType(CreateProgram) { }

@Entity()
export class ProgramTable {
    @PrimaryGeneratedColumn({unsigned:false})
    id: number;
    @Column({length:50})
    name: string;
    @CreateDateColumn()
    createdDatetime: Date;
}