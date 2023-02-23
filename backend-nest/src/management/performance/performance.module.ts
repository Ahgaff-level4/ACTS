import { Module } from '@nestjs/common';
import { PerformanceService } from './performance.service';
import { PerformanceController } from './performance.controller';
import { DatabaseService } from 'src/database.service';
import { TypeOrmModule } from '@nestjs/typeorm';
// import { PerformanceTable } from './performance.entity';

@Module({
  // imports:[TypeOrmModule.forFeature([PerformanceTable])],
  providers: [PerformanceService,DatabaseService],
  controllers: [PerformanceController]
})
export class PerformanceModule {}
