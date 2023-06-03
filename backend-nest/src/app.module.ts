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
import { FieldEntity } from './management/field/field.entity';
import { PersonEntity, PersonView } from './management/person/person.entity';
import { AccountEntity } from './management/account/account.entity';
import { PersonModule } from './management/person/person.module';
import { ActivityEntity } from './management/activity/activity.entity';
import { ChildEntity } from './management/child/child.entity';
import { EvaluationEntity } from './management/evaluation/evaluation.entity';
import { GoalEntity } from './management/goal/Goal.entity';
import { ProgramEntity } from './management/program/program.entity';
import { OtherModule } from './management/other/other.module';
import { ReportModule } from './management/report/report.module';
import { NotificationGateway } from './websocket/notification.gateway';

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
      entities: [AccountEntity, ActivityEntity,
        ChildEntity, EvaluationEntity, FieldEntity,
        GoalEntity, PersonEntity, PersonView, ProgramEntity
      ],
      synchronize: true,
      autoLoadEntities: true,
      retryAttempts: 1
    }),
    AccountModule, ActivityModule, ChildModule,
    EvaluationModule, FieldModule, GoalModule,
    PersonModule, ProgramModule, AuthModule,OtherModule,
    ReportModule,
    // NotificationModule
  ],
  providers: [{
    provide: APP_GUARD,
    useClass: RolesGuard,
  },{provide:'Notification',useClass:NotificationGateway}]
})
export class AppModule {
}
