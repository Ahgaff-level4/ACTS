import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { CustomTimeframe, IChildReport, IDashboard } from '../../../../interfaces';
import { Roles } from 'src/auth/Role.guard';
import { ReportService } from './report.service';


@Controller('api/report')
export class ReportController {
	constructor(private service: ReportService) { }

	@Get('dashboard')
	async getDashboard(@Query() query: CustomTimeframe): Promise<IDashboard> {
		return this.service.dashboard(query.from ?? new Date(0), query.to ?? new Date());//from default is All Time. and to is Now.
	}

	@Get('child/:id')
	@Roles('Admin', 'HeadOfDepartment')
	async getChildReport(@Param('id', ParseIntPipe) id: number, @Query() query: CustomTimeframe): Promise<IChildReport> {
		if (!query.from)
			query.from = new Date(new Date().getFullYear() + '-' + (new Date().getMonth() + 1).toString().padStart(2, '0') + '-01');//first day at current month. Ex:'2023-06-17' => '2023-06-01'
		if (!query.to)
			query.to = new Date();//to now
		return this.service.childReport(id, query.from, query.to);
	}
}
