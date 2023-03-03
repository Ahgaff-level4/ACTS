import { Module } from '@nestjs/common';
import { GoalController } from './goal.controller';
import { GoalService } from './goal.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProgramEntity, ProgramView } from '../program/program.entity';
import { GoalEntity } from './Goal.entity';

@Module({
	imports:[TypeOrmModule.forFeature([GoalEntity])],
	controllers:[GoalController],
	providers:[GoalService]
})
export class GoalModule {}
