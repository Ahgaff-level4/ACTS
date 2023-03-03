import { Module } from '@nestjs/common';
import { EvaluationController } from './evaluation.controller';
import { EvaluationService } from './evaluation.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EvaluationEntity } from './evaluation.entity';

@Module({
	imports:[TypeOrmModule.forFeature([EvaluationEntity])],
	controllers:[EvaluationController],
	providers:[EvaluationService]
})
export class EvaluationModule {}
