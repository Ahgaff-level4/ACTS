import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
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
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { PersonModule } from './management/person/person.module';
import { OtherModule } from './management/other/other.module';
import { ReportModule } from './management/report/report.module';
import { AppController } from './app.controller';
import { AngularMiddleware } from './angular.middleware';
import { TypeOrmOptions } from 'datasource.config.js';




@Module({
  imports: [
    TypeOrmModule.forRoot(TypeOrmOptions),
    AccountModule, ActivityModule, ChildModule,
    EvaluationModule, FieldModule, GoalModule,
    PersonModule, ProgramModule, AuthModule, OtherModule,
    ReportModule,
  ],
  controllers: [AppController],
  providers: [{
    provide: APP_GUARD,
    useClass: RolesGuard,
  }]
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AngularMiddleware)
      .forRoutes({
        path: '/**', // For all routes because AngularMiddleware will check if route is not Angular then next()
        method: RequestMethod.ALL, // For all methods
      })
  }
}