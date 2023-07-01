import { Module } from '@nestjs/common';
import { EvaluationController } from './evaluation.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EvaluationEntity } from './evaluation.entity';
import { NotificationModule } from 'src/notification/notification.module';

@Module({
	imports:[TypeOrmModule.forFeature([EvaluationEntity]),NotificationModule],
	controllers:[EvaluationController],

})
export class EvaluationModule {}
