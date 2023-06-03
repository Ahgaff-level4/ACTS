import { Module } from '@nestjs/common';
import { EvaluationController } from './evaluation.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EvaluationEntity } from './evaluation.entity';
import { NotificationGateway } from 'src/websocket/notification.gateway';

@Module({
	imports:[TypeOrmModule.forFeature([EvaluationEntity])],
	controllers:[EvaluationController],
	providers:[{provide:'Notification',useClass:NotificationGateway}]

})
export class EvaluationModule {}
