import { Module } from '@nestjs/common';
import { GoalController } from './goal.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GoalEntity } from './Goal.entity';
import { NotificationModule } from 'src/websocket/notification.module';

@Module({
	imports:[TypeOrmModule.forFeature([GoalEntity]),NotificationModule],
	controllers:[GoalController],

})
export class GoalModule {}
