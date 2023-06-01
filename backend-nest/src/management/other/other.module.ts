import { Module } from '@nestjs/common';
import { OtherController } from './other.controller';
import { NotificationGateway } from 'src/websocket/notification.gateway';

@Module({
	controllers: [OtherController],
	providers:[NotificationGateway]
})
export class OtherModule {
}
