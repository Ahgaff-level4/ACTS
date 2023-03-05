import { Module } from '@nestjs/common';
import { FieldModule } from './management/field/field.module';
import { AccountModule } from './management/account/account.module';
import { ActivityModule } from './management/activity/activity.module';
import { ProgramModule } from './management/program/program.module';
import { ChildModule } from './management/child/child.module';
import { GoalModule } from './management/goal/goal.module';
import { EvaluationModule } from './management/evaluation/evaluation.module';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './auth/Role.guard';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { config } from 'dotenv'
import { FieldEntity, FieldView } from './management/field/field.entity';
import { PersonEntity, PersonView } from './management/person/person.entity';
import { AccountEntity, AccountView } from './management/account/account.entity';
import { PersonModule } from './management/person/person.module';
import { ActivityEntity } from './management/activity/activity.entity';
import { ChildEntity, ChildView } from './management/child/child.entity';
import { EvaluationEntity } from './management/evaluation/evaluation.entity';
import { GoalEntity } from './management/goal/Goal.entity';
import { ProgramEntity, ProgramView } from './management/program/program.entity';
config();

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.HOST_DB,
      port: +process.env.PORT_DB,
      username: process.env.USER_DB,
      password: process.env.PASSWORD_DB,
      database: process.env.DATABASE,
      entities: [AccountEntity, AccountView, ActivityEntity,
        ChildEntity, ChildView, EvaluationEntity, FieldEntity, FieldView,
        GoalEntity, PersonEntity, PersonView, ProgramEntity, ProgramView
      ],

      synchronize: true,
      autoLoadEntities: true,
      retryAttempts: 1
    }),
    AccountModule, ActivityModule, ChildModule,
    EvaluationModule, FieldModule, GoalModule,
    PersonModule, ProgramModule, AuthModule
  ],
  providers: [{
    provide: APP_GUARD,
    useClass: RolesGuard,
  },]
})
export class AppModule {
  constructor(private dataSource: DataSource) { }
}
