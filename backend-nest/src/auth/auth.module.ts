import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AccountModule } from 'src/management/account/account.module';
import { AccountService } from 'src/management/account/account.service';
import { NotificationGateway } from 'src/websocket/notification.gateway';

@Module({
  imports:[AccountModule],
  providers: [AuthService,{provide:'Notification',useClass:NotificationGateway}],
  controllers: [AuthController],
})
export class AuthModule {}
