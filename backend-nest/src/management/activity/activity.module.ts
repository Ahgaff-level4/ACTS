import { Module } from '@nestjs/common';
import { ActivityService } from './activity.service';
import { ActivityController } from './activity.controller';
import { DatabaseService } from 'src/database.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityEntity } from './activity.entity';

@Module({
  imports:[TypeOrmModule.forFeature([ActivityEntity])],
  providers: [ActivityService,DatabaseService],
  controllers: [ActivityController]
})
export class PerformanceModule {}
