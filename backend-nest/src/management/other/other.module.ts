import { Module } from '@nestjs/common';
import { OtherController } from './other.controller';
import { NotificationModule } from 'src/notification/notification.module';

@Module({
	controllers: [OtherController],
	imports: [NotificationModule]
})
export class OtherModule {
}
