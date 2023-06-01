import { Module } from '@nestjs/common';
import { ChildService } from './child.service';
import { ChildController } from './child.controller';
import { UtilityService } from 'src/utility.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChildEntity } from './child.entity';
import { NotificationGateway } from 'src/websocket/notification.gateway';

@Module({
  imports:[TypeOrmModule.forFeature([ChildEntity])],
  controllers: [ChildController],
  providers: [ChildService,UtilityService,NotificationGateway]
})
export class ChildModule {}
