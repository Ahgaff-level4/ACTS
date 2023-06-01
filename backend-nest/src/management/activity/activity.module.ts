import { Module } from '@nestjs/common';
import { ActivityService } from './activity.service';
import { ActivityController } from './activity.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityEntity } from './activity.entity';
import { NotificationGateway } from 'src/websocket/notification.gateway';

@Module({
  imports:[TypeOrmModule.forFeature([ActivityEntity])],
  providers: [ActivityService,NotificationGateway],
  controllers: [ActivityController]
})
export class ActivityModule {}
