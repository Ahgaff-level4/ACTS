import { Module } from '@nestjs/common';
import { FieldModule } from './management/field/field.module';
import { AccountModule } from './management/account/account.module';
import { PerformanceModule } from './management/activity/activity.module';
import { ProgramModule } from './management/program/program.module';
import { ChildModule } from './management/child/child.module';
import { ParentModule } from './management/parent/parent.module';
import { HdModule } from './management/hd/hd.module';
import { TeacherModule } from './management/teacher/teacher.module';
import { GoalModule } from './management/goal/goal.module';
import { EvaluationModule } from './management/evaluation/evaluation.module';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './auth/Role.guard';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
// import { ProgramTable } from './management/program/program.entity';
import {config} from 'dotenv'
import { FieldEntity } from './management/field/field.entity';
import { PersonEntity, PersonView } from './management/person/person.entity';
import { AccountEntity, AccountView } from './management/account/account.entity';
import { PersonModule } from './management/person/person.module';
// import { PerformanceTable } from './management/performance/performance.entity';
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
      entities: [PersonEntity,PersonView,AccountEntity,AccountView],
      synchronize: true,
      autoLoadEntities:true,
      retryAttempts:1
    }),
    FieldModule, AccountModule, PersonModule,
    PerformanceModule, ProgramModule, ChildModule,
    ParentModule, HdModule, TeacherModule,
    GoalModule, EvaluationModule, AuthModule],
  providers: [{
    provide: APP_GUARD,
    useClass: RolesGuard,
  },]
})
export class AppModule {
  constructor(private dataSource: DataSource) { }
}
