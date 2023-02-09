import { Module } from '@nestjs/common';
import { PerformanceService } from './performance.service';
import { PerformanceController } from './performance.controller';
import { DatabaseService } from 'src/database.service';

@Module({
  providers: [PerformanceService,DatabaseService],
  controllers: [PerformanceController]
})
export class PerformanceModule {}
