import { Module } from '@nestjs/common';
import { ReportController } from './report.controller';

@Module({
	controllers: [ReportController],
})
export class ReportModule {
}
