import { Module } from '@nestjs/common';
import { AccountService } from './account.service';
import { AccountController } from './account.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountEntity } from './account.entity';
import { RoleEntity } from './role/role.entity';

@Module({
  exports:[AccountService],
  imports:[TypeOrmModule.forFeature([AccountEntity,RoleEntity])],
  providers: [AccountService],
  controllers: [AccountController]
})
export class AccountModule {}
