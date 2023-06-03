import { Module } from '@nestjs/common';
import { ReportController } from './report.controller';
import { NotificationGateway } from 'src/websocket/notification.gateway';

@Module({
	controllers: [ReportController],
})
export class ReportModule {
}
