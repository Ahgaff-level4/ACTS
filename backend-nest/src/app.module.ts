import { Module } from '@nestjs/common';
import { FieldModule } from './management/field/field.module';
import { AccountModule } from './management/account/account.module';
import { PerformanceModule } from './management/performance/performance.module';
import { ProgramModule } from './management/program/program.module';
import { ChildModule } from './management/child/child.module';
import { PersonModule } from './management/person/person.module';
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
import { ProgramTable } from './management/program/program.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 2048,
      username: 'root',
      password: '32185279',
      database: 'acts_typeorm',
      entities: [ProgramTable],
      synchronize: true,
      retryAttempts:2
    }),
    FieldModule, AccountModule,
    PerformanceModule, ProgramModule, ChildModule,
    PersonModule, ParentModule, HdModule, TeacherModule,
    GoalModule, EvaluationModule, AuthModule],
  providers: [{
    provide: APP_GUARD,
    useClass: RolesGuard,
  },]
})
export class AppModule {
  constructor(private dataSource: DataSource) { }
}
