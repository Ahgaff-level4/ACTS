import { PartialType } from "@nestjs/mapped-types";
import { Type } from "class-transformer";
import { IsDate, IsEnum, MaxLength } from "class-validator";
import { IsOptional, IsString } from "class-validator";
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";
import { Gender, ICreatePerson } from "../../../../interfaces.d";

export class CreatePerson implements ICreatePerson {
	@IsString() @MaxLength(100)
	@Column({ type: 'nvarchar', length: 100, unique: false, nullable: false })
	public name: string;

	@Type(() => Date) @IsOptional() @IsDate()
	@Column({ type: 'date', unique: false, nullable: true })
	public birthDate?: string;

	@IsEnum({ "Male": "Male", "Female": "Female" })
	@Column({ type: 'enum', enum: ['Male', 'Female'], unique: false, nullable: false })
	public gender: Gender;

	@Type(() => Date) @IsOptional() @IsDate()
	@CreateDateColumn({ type: 'datetime', unique: false })
	public createdDatetime: Date;

}

export class UpdatePerson extends PartialType(CreatePerson) { }

@Entity()
export class PersonEntity extends CreatePerson {
	@PrimaryGeneratedColumn({ type: 'int', unsigned: true })
	public id: number;
	
	@Column({ type: 'nvarchar', length: 120, unique: true, nullable: true }) @IsOptional()
	public image: string;
}
