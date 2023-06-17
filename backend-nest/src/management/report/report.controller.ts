import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { Between, DataSource, Equal, FindOptionsWhere, MoreThan, MoreThanOrEqual, Not } from 'typeorm';
import { CustomTimeframe, IChildReport, IDashboard, Timeframe } from '../../../../interfaces';
import { ChildEntity } from '../child/child.entity';
import { PersonEntity } from '../person/person.entity';
import { AccountEntity } from '../account/account.entity';
import { Roles } from 'src/auth/Role.guard';
import { GoalEntity } from '../goal/Goal.entity';


@Controller('api/report')
export class ReportController {
	constructor(@InjectDataSource() private dataSource: DataSource) { }

	@Roles('Admin')
	@Get('dashboard')
	async getDashboard(@Query() query: { timeframe: Timeframe }): Promise<IDashboard> {
		let timeframe: Date
		switch (query.timeframe) {//default 'Yearly'
			case 'Weekly': timeframe = new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000); break;
			case 'Monthly': timeframe = new Date(new Date().getFullYear(), new Date().getMonth() - 1, new Date().getDate()); break;
			case 'All Time': timeframe = new Date(0); break;
			default: timeframe = new Date(new Date().getFullYear() - 1, new Date().getMonth(), new Date().getDate()); break;
		}

		const children = (await this.dataSource.getRepository(ChildEntity)
			.find({ relations: ['person'], where: { isArchive: false, person: { createdDatetime: MoreThanOrEqual(timeframe) } } })
		);
		const childrenCount = (await this.dataSource.getRepository(ChildEntity).countBy({ isArchive: false }))

		return { children, childrenCount }
	}

	@Get('child/:id')
	@Roles('Admin', 'HeadOfDepartment')
	async getChildReport(@Param('id', ParseIntPipe) id: number, @Query() query: CustomTimeframe): Promise<IChildReport> {
		console.log('query', query);
		if (!query.from)
			query.from = new Date(0);//from minimum allowed date
		if (!query.to)
			query.to = new Date();//to now

		const child = (await this.dataSource.getRepository(ChildEntity)
			.createQueryBuilder('child')
			.leftJoinAndMapOne('child.person', PersonEntity, 'person', 'child.personId=person.id')
			.leftJoinAndSelect('child.teachers', 'teacher')
			.leftJoinAndMapOne('teacher.person', PersonEntity, 'teacherPerson', 'teacher.personId=teacherPerson.id')
			.leftJoinAndMapOne('child.parent', AccountEntity, 'parentAccount', 'child.parentId=parentAccount.id')
			.leftJoinAndMapOne('parentAccount.person', PersonEntity, 'parentPerson', 'parentAccount.personId=parentPerson.id')
			.where('child.id=:id', { id })
			.getMany())[0];
		// let timeframe: Date
		// switch (query.timeframe) {//default 'All Time'
		// 	case 'Weekly': timeframe = new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000); break;
		// 	case 'Monthly': timeframe = new Date(new Date().getFullYear(), new Date().getMonth() - 1, new Date().getDate()); break;
		// 	case 'Yearly': timeframe = new Date(new Date().getFullYear() - 1, new Date().getMonth(), new Date().getDate()); break;
		// 	default: timeframe = new Date(0);
		// }
		// const completedCount = await this.dataSource.getRepository(GoalEntity)
		// 	.countBy({
		// 		childId: id, state: 'completed', assignDatetime: Between(new Date(query.from), new Date(query.to))
		// 	});
		// const continualCount = await this.dataSource.getRepository(GoalEntity)
		// 	.countBy({ childId: id, state: 'continual', assignDatetime: Between(new Date(query.from), new Date(query.to)) });
		const goals = await this.dataSource.getRepository(GoalEntity)
			.find({ relations: ['activity'], where: { childId: id, state: Not('strength'), assignDatetime: Between(new Date(query.from), new Date(query.to)) } });

		const strengths = await this.dataSource.getRepository(GoalEntity)
			.find({ relations: ['activity'], where: { childId: id, state: 'strength', assignDatetime: Between(new Date(query.from), new Date(query.to)) } });
		const completedCount = goals.filter(v => v.state == 'completed').length;
		const continualCount = goals.filter(v => v.state == 'continual').length;
		return { child, goal: { completedCount, continualCount }, goalStrength: { goals, strengths }, };
	}
}
