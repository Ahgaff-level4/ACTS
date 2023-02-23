import { PartialType } from "@nestjs/mapped-types";
import { Type } from "class-transformer";
import { IsDate, MaxDate, MinDate } from "class-validator";
import { IsBoolean, IsOptional, IsString } from "class-validator";
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, ViewColumn, ViewEntity } from "typeorm";
import { ICreatePerson, IPersonEntity } from "../../../../interfaces";

export class CreatePerson implements ICreatePerson {
	@IsString()
	@ViewColumn()
	@Column({ type:'nvarchar', length: 50,unique:false,nullable:false })
	public name: string;

	@Type(()=>Date) 
	@IsOptional() @IsDate() @MinDate(new Date('1900-01-01')) @MaxDate(new Date('2075-01-01'))
	@ViewColumn()
	@Column({ type: 'date',unique:false, nullable: true })
	public birthDate?: string;

	@IsBoolean()
	@ViewColumn()
	@Column({ type: 'bool', width: 1,unique:false,nullable:false })
	public isMale: boolean;

	@Type(()=>Date)
	@IsOptional() @IsDate() @MinDate(new Date('2000-01-01')) @MaxDate(new Date('2075-01-01'))
	@ViewColumn()
	@CreateDateColumn({ type: 'datetime',unique:false })
	public createdDatetime: Date;
}

export class UpdatePerson extends PartialType(CreatePerson) { }

@Entity()
export class PersonEntity extends CreatePerson {
	@ViewColumn()
	@PrimaryGeneratedColumn({ type: 'int', unsigned: true })
	public id: number;
}


@ViewEntity({
	expression: `SELECT id, name, birthDate, createdDatetime,isMale,
								TIMESTAMPDIFF(YEAR, birthDate, CURDATE()) AS age FROM person_entity;
`
})
export class PersonView extends PersonEntity implements IPersonEntity {
	@ViewColumn()
	public age: number;
}