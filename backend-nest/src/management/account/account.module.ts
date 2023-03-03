import { Module } from '@nestjs/common';
import { AccountService } from './account.service';
import { AccountController } from './account.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountEntity, AccountView } from './account.entity';

@Module({
  imports:[TypeOrmModule.forFeature([AccountEntity,AccountView])],
  providers: [AccountService],
  controllers: [AccountController]
})
export class AccountModule {}
