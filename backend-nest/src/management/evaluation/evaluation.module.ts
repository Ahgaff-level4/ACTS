import { Module } from '@nestjs/common';
import { EvaluationController } from './evaluation.controller';
import { EvaluationService } from './evaluation.service';
import { DatabaseService } from 'src/database.service';

@Module({
	controllers:[EvaluationController],
	providers:[EvaluationService,DatabaseService]
})
export class EvaluationModule {}
