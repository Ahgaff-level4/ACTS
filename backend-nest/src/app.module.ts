import { Module } from '@nestjs/common';

import { FieldModule } from './management/field/field.module';
import { LoginModule } from './auth/login/login.module';
import { AccountModule } from './management/account/account.module';

@Module({
  imports: [FieldModule, LoginModule, AccountModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
