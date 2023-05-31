import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, MoreThan, MoreThanOrEqual } from 'typeorm';
import { IChildReport, Timeframe } from '../../../../interfaces';
import { ChildEntity } from '../child/child.entity';
import { PersonEntity } from '../person/person.entity';
import { AccountEntity } from '../account/account.entity';
import { Roles } from 'src/auth/Role.guard';
import { GoalEntity } from '../goal/Goal.entity';


@Controller('api/report')
export class ReportController {
	constructor(@InjectDataSource() private dataSource: DataSource) { }


	@Get('child/:id')
	@Roles('Admin', 'HeadOfDepartment')
	async getChildReport(@Param('id', ParseIntPipe) id: number, @Query() query: { timeframe: Timeframe }): Promise<IChildReport> {
		const child = (await this.dataSource.getRepository(ChildEntity)
			.createQueryBuilder('child')
			.leftJoinAndMapOne('child.person', PersonEntity, 'person', 'child.personId=person.id')
			.leftJoinAndSelect('child.teachers', 'teacher')
			.leftJoinAndMapOne('teacher.person', PersonEntity, 'teacherPerson', 'teacher.personId=teacherPerson.id')
			.leftJoinAndMapOne('child.parent', AccountEntity, 'parentAccount', 'child.parentId=parentAccount.id')
			.leftJoinAndMapOne('parentAccount.person', PersonEntity, 'parentPerson', 'parentAccount.personId=parentPerson.id')
			.where('child.id=:id', { id })
			.getMany())[0];
		let timeframe: Date
		if (query.timeframe == 'Weekly')
			timeframe = new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000)
		else if (query.timeframe == 'Monthly')
			timeframe = new Date(new Date().getFullYear(), new Date().getMonth() - 1, new Date().getDate());
		else if (query.timeframe == 'Yearly')
			timeframe = new Date(new Date().getFullYear() - 1, new Date().getMonth(), new Date().getDate());
		else timeframe = new Date(0);
		const completedCount = await this.dataSource.getRepository(GoalEntity)
			.countBy({
				childId: id, state: 'completed', assignDatetime: MoreThanOrEqual(timeframe)
			});
		const continualCount = await this.dataSource.getRepository(GoalEntity)
			.countBy({ childId: id, state: 'continual', assignDatetime: MoreThanOrEqual(timeframe) });

		return { child, goal: { completedCount, continualCount } };
	}
}
