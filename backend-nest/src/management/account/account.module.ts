import { Module } from '@nestjs/common';
import { AccountService } from './account.service';
import { AccountController } from './account.controller';
import { DatabaseService } from 'src/database.service';

@Module({
  providers: [AccountService,DatabaseService],
  controllers: [AccountController]
})
export class AccountModule {}
