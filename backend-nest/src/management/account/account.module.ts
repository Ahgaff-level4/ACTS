import { Module } from '@nestjs/common';
import { AccountService } from './account.service';
import { AccountController } from './account.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountEntity } from './account.entity';
import { RoleEntity } from './role/role.entity';
import { NotificationModule } from 'src/notification/notification.module';

@Module({
  exports: [AccountService],
  imports: [TypeOrmModule.forFeature([AccountEntity, RoleEntity]), NotificationModule],
  providers: [AccountService,],
  controllers: [AccountController]
})
export class AccountModule { }
