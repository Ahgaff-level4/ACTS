import { Module } from '@nestjs/common';
import { GoalController } from './goal.controller';
import { GoalService } from './goal.service';
import { DatabaseService } from 'src/database.service';

@Module({
	controllers:[GoalController],
	providers:[GoalService,DatabaseService]
})
export class GoalModule {}
