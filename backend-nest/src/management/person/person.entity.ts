import { PartialType } from "@nestjs/mapped-types";
import { Type } from "class-transformer";
import { IsDate, MaxDate, MaxLength, MinDate } from "class-validator";
import { IsBoolean, IsOptional, IsString } from "class-validator";
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, ViewColumn, ViewEntity } from "typeorm";
import { ICreatePerson, IPersonEntity } from "../../../../interfaces";

export class CreatePerson implements ICreatePerson {
	@IsString() @MaxLength(50)
	@ViewColumn()
	@Column({ type: 'nvarchar', length: 50, unique: false, nullable: false })
	public name: string;

	@Type(() => Date) @IsOptional() @IsDate()
	@ViewColumn()
	@Column({ type: 'date', unique: false, nullable: true })
	public birthDate?: string;

	@IsBoolean()
	@ViewColumn()
	@Column({ type: 'bool', width: 1, unique: false, nullable: false })
	public isMale: boolean;

	@Type(() => Date) @IsOptional() @IsDate()
	@ViewColumn()
	@CreateDateColumn({ type: 'datetime', unique: false })
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
	// expression: `SELECT id, name, birthDate, createdDatetime,isMale,
	// TIMESTAMPDIFF(YEAR, birthDate, CURDATE()) AS age FROM person_entity;`
	
	expression: (connection) => connection.createQueryBuilder()
		.select('person.id', 'id')
		.addSelect('TIMESTAMPDIFF(YEAR, birthDate, CURDATE())', 'age')
		.addSelect('person.name', 'name')
		.addSelect('person.birthDate', 'birthDate')
		.addSelect('person.isMale', 'isMale')
		.addSelect('person.createdDatetime', 'createdDatetime')
		.from(PersonEntity, 'person')
})
export class PersonView extends PersonEntity implements IPersonEntity {
	@ViewColumn()
	public age: number;
}