import { PartialType } from "@nestjs/mapped-types";
import { Type } from "class-transformer";
import { IsDate, IsEnum, MaxLength } from "class-validator";
import { IsBoolean, IsOptional, IsString } from "class-validator";
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, ViewColumn, ViewEntity } from "typeorm";
import { Gender, ICreatePerson, IPersonEntity } from "../../../../interfaces.d";

export class CreatePerson implements ICreatePerson {
	@IsString() @MaxLength(50)
	@ViewColumn()
	@Column({ type: 'nvarchar', length: 50, unique: false, nullable: false })
	public name: string;

	@Type(() => Date) @IsOptional() @IsDate()
	@ViewColumn()
	@Column({ type: 'date', unique: false, nullable: true })
	public birthDate?: string;

	@IsEnum({"Male":"Male","Female":"Female"})
	@ViewColumn()
	@Column({ type: 'enum',enum:['Male','Female'], unique: false, nullable: false })
	public gender: Gender;

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
	expression: (connection) => connection.createQueryBuilder()
		.select('person.id', 'id')
		.addSelect('person.name', 'name')
		.addSelect('person.birthDate', 'birthDate')
		.addSelect('TIMESTAMPDIFF(YEAR, birthDate, CURDATE())', 'age')
		.addSelect('person.gender', 'gender')
		.addSelect('person.createdDatetime', 'createdDatetime')
		.from(PersonEntity, 'person')
})
export class PersonView extends PersonEntity implements IPersonEntity {
	@ViewColumn()
	public age: number;
}