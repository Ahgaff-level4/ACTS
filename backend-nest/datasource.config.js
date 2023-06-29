// import { TypeOrmModuleOptions } from "@nestjs/typeorm";
// import { DataSource, DataSourceOptions } from "typeorm";
import { config } from 'dotenv'
import { AccountEntity } from 'src/management/account/account.entity';
import { RoleEntity } from 'src/management/account/role/role.entity';
import { ActivityEntity } from 'src/management/activity/activity.entity';
import { ChildEntity } from 'src/management/child/child.entity';
import { EvaluationEntity } from 'src/management/evaluation/evaluation.entity';
import { FieldEntity } from 'src/management/field/field.entity';
import { GoalEntity } from 'src/management/goal/Goal.entity';
import { PersonEntity } from 'src/management/person/person.entity';
import { ProgramEntity } from 'src/management/program/program.entity';
import { DataSource } from 'typeorm';
config();
export const TypeOrmOptions = {
	type: 'mysql',
	host: process.env.HOST_DB,
	port: +process.env.PORT_DB,
	username: process.env.USER_DB,
	password: process.env.PASSWORD_DB,
	database: process.env.DATABASE,
	entities: [AccountEntity, RoleEntity, ActivityEntity,
		ChildEntity, EvaluationEntity, FieldEntity,
		GoalEntity, PersonEntity, ProgramEntity
	],
	synchronize: process.env.PRODUCTION == 'false' ? true : false,
	migrationsTableName: "migrations",
	migrations: ['./migrations/*.ts']
}
export default new DataSource(TypeOrmOptions)