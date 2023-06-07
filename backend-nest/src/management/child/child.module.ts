import { Module } from '@nestjs/common';
import { ChildService } from './child.service';
import { ChildController } from './child.controller';
import { UtilityService } from 'src/utility.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChildEntity } from './child.entity';
import { NotificationModule } from 'src/websocket/notification.module';

@Module({
  imports:[TypeOrmModule.forFeature([ChildEntity]),NotificationModule],
  controllers: [ChildController],
  providers: [ChildService,UtilityService],
  
})
export class ChildModule {}
