import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AccountModule } from 'src/management/account/account.module';
import { NotificationModule } from 'src/websocket/notification.module';

@Module({
  imports:[AccountModule,NotificationModule],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
