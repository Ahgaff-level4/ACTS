import { Module } from '@nestjs/common';
import { EvaluationController } from './evaluation.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EvaluationEntity } from './evaluation.entity';

@Module({
	imports:[TypeOrmModule.forFeature([EvaluationEntity])],
	controllers:[EvaluationController],
})
export class EvaluationModule {}
