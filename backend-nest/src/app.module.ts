import { Module } from '@nestjs/common';

import { FieldModule } from './management/field/field.module';
import { LoginModule } from './auth/login/login.module';
import { AccountModule } from './management/account/account.module';
import { PerformanceModule } from './management/performance/performance.module';
import { DatabaseService } from './database.service';
import { UtilityService } from './utility.service';
import { ProgramModule } from './management/program/program.module';
import { ChildModule } from './management/child/child.module';
import { PersonModule } from './management/person/person.module';
import { ParentModule } from './management/parent/parent.module';

@Module({
  imports: [FieldModule, LoginModule, AccountModule, PerformanceModule, ProgramModule, ChildModule, PersonModule, ParentModule],
  controllers: [],
  providers: [DatabaseService, UtilityService],
})
export class AppModule { }
