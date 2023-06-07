import { Module } from '@nestjs/common';
import { OtherController } from './other.controller';
import { NotificationGateway } from 'src/websocket/notification.gateway';
import { NotificationModule } from 'src/websocket/notification.module';

@Module({
	controllers: [OtherController],
	imports: [NotificationModule]
})
export class OtherModule {
}
