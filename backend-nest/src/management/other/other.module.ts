import { Module } from '@nestjs/common';
import { OtherController } from './other.controller';
import { NotificationModule } from 'src/notification/notification.module';
import { OtherService } from './other.service';

@Module({
	controllers: [OtherController],
	imports: [NotificationModule],
	providers: [OtherService],
})
export class OtherModule {
}
