import { Module } from '@nestjs/common';
import { GoalController } from './goal.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GoalEntity } from './goal.entity';
import { NotificationModule } from 'src/notification/notification.module';

@Module({
	imports:[TypeOrmModule.forFeature([GoalEntity]),NotificationModule],
	controllers:[GoalController],

})
export class GoalModule {}
