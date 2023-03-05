import { Module } from '@nestjs/common';
import { AccountService } from './account.service';
import { AccountController } from './account.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountEntity, AccountView } from './account.entity';
import { RoleEntity } from './role/role.entity';

@Module({
  imports:[TypeOrmModule.forFeature([AccountEntity,AccountView,RoleEntity])],
  providers: [AccountService],
  controllers: [AccountController]
})
export class AccountModule {}
