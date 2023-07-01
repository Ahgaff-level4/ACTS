import { Module } from '@nestjs/common';
import { ActivityService } from './activity.service';
import { ActivityController } from './activity.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityEntity } from './activity.entity';
import { NotificationModule } from 'src/notification/notification.module';

@Module({
  imports: [TypeOrmModule.forFeature([ActivityEntity]), NotificationModule],
  providers: [ActivityService],
  controllers: [ActivityController]
})
export class ActivityModule { }
