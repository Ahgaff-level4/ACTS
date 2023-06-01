import { Module } from '@nestjs/common';
import { GoalController } from './goal.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GoalEntity } from './Goal.entity';
import { NotificationGateway } from 'src/websocket/notification.gateway';

@Module({
	imports:[TypeOrmModule.forFeature([GoalEntity])],
	controllers:[GoalController],
	providers:[NotificationGateway]
})
export class GoalModule {}
