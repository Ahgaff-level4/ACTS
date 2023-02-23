import { Module } from '@nestjs/common';
import { AccountService } from './account.service';
import { AccountController } from './account.controller';
import { DatabaseService } from 'src/database.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountEntity } from './account.entity';

@Module({
  imports:[TypeOrmModule.forFeature([AccountEntity])],
  providers: [AccountService,DatabaseService],
  controllers: [AccountController]
})
export class AccountModule {}
