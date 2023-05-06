import { Module } from '@nestjs/common';
import { GoalController } from './goal.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GoalEntity } from './Goal.entity';

@Module({
	imports:[TypeOrmModule.forFeature([GoalEntity])],
	controllers:[GoalController],
})
export class GoalModule {}
