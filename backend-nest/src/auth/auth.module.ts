import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AccountModule } from 'src/management/account/account.module';
import { AccountService } from 'src/management/account/account.service';

@Module({
  imports:[AccountModule],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
