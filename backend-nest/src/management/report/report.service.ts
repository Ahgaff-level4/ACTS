/* eslint-disable prefer-const */
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { Between, DataSource, IsNull, MoreThan, Not } from 'typeorm';
import { IChildReport, IDashboard } from '../../../../interfaces';
import { ChildEntity } from '../child/child.entity';
import { ProgramEntity } from '../program/program.entity';
import { FieldEntity } from '../field/field.entity';
import { AccountEntity } from '../account/account.entity';
import { GoalEntity } from '../goal/goal.entity';
import { PersonEntity } from '../person/person.entity';
import { EvaluationEntity } from '../evaluation/evaluation.entity';
import { ActivityEntity } from '../activity/activity.entity';

@Injectable()
export class ReportService {
	constructor(@InjectDataSource() private dataSource: DataSource) { }

	public async dashboard(from: Date | string, to: Date | string): Promise<IDashboard> {
		const range = Between(new Date(from), new Date(to));
		const children = (await this.dataSource.getRepository(ChildEntity)
			.find({ relations: ['person'], where: { isArchive: false, person: { createdDatetime: range } } })
		);
		//counts
		const counts: IDashboard['counts'] = {
			childrenNotArchive: (await this.dataSource.getRepository(ChildEntity).count({
				relations: ['person'], where: { isArchive: false, person: { createdDatetime: range } }
			})),
			childrenArchive: (await this.dataSource.getRepository(ChildEntity).count({
				relations: ['person'], where: { isArchive: true, person: { createdDatetime: range } }
			})),
			programs: (await this.dataSource.getRepository(ProgramEntity).countBy({ createdDatetime: range })),
			fields: (await this.dataSource.getRepository(FieldEntity).countBy({ createdDatetime: range })),
			accounts: (await this.dataSource.getRepository(AccountEntity).count({
				relations: ['person'], where: { person: { createdDatetime: range } }
			})),
			completedGoals: (await this.dataSource.getRepository(GoalEntity).countBy({ state: 'completed', assignDatetime: range })),
			continualGoals: (await this.dataSource.getRepository(GoalEntity).countBy({ state: 'continual', assignDatetime: range })),
			strengths: (await this.dataSource.getRepository(GoalEntity).countBy({ state: 'strength', assignDatetime: range })),
			activities: (await this.dataSource.getRepository(ActivityEntity).countBy({ programId: MoreThan(0), createdDatetime: range })),
			evaluations: (await this.dataSource.getRepository(EvaluationEntity).countBy({ evaluationDatetime: range })),
			specialActivities: (await this.dataSource.getRepository(ActivityEntity).countBy({ programId: IsNull(), createdDatetime: range })),
		};


		const dashboard: IDashboard = {
			children,
			counts,
			childrenNotArchiveCount: (await this.dataSource.getRepository(ChildEntity).countBy({ isArchive: false })),
			childrenArchiveCount: (await this.dataSource.getRepository(ChildEntity).countBy({ isArchive: true })),
			programsCount: (await this.dataSource.getRepository(ProgramEntity).count()),
			fieldsCount: (await this.dataSource.getRepository(FieldEntity).count()),
			accountsCount: (await this.dataSource.getRepository(AccountEntity).count()),
			completedGoalsCount: (await this.dataSource.getRepository(GoalEntity).countBy({ state: 'completed', })),
			continualGoalsCount: (await this.dataSource.getRepository(GoalEntity).countBy({ state: 'continual', })),
			strengthsCount: (await this.dataSource.getRepository(GoalEntity).countBy({ state: 'strength', })),
			activitiesCount: (await this.dataSource.getRepository(ActivityEntity).countBy({ programId: MoreThan(0) })),
			evaluationsCount: (await this.dataSource.getRepository(EvaluationEntity).count()),
			specialActivitiesCount: (await this.dataSource.getRepository(ActivityEntity).countBy({ programId: IsNull() })),

		}

		return dashboard;
	}

	public async childReport(id: number, from: Date | string, to: Date | string): Promise<IChildReport> {


		//See IChildReport documentation for more information about new/current and old/origin calculations

		let newFrom = new Date(from);
		let newTo = new Date(to);
		let durationSpan = newTo.getTime() - newFrom.getTime();//duration in millisecond
		let originFrom = new Date(newFrom.getTime() - durationSpan);
		let originTo = newFrom;
		const newTimeframe = Between(newFrom, newTo);
		const originTimeframe = Between(originFrom, originTo);

		//we use promise all to retrieve data in a parallel fashion
		const [child,
			evaluationsNEW,
			evaluationsORIGIN,
			goalsNEW,
			goalsORIGIN,
			strengthsNEW,
			strengthsORIGIN,
		] = await Promise.all([this.dataSource.getRepository(ChildEntity)
			.createQueryBuilder('child')
			.leftJoinAndMapOne('child.person', PersonEntity, 'person', 'child.personId=person.id')
			.leftJoinAndSelect('child.teachers', 'teacher')
			.leftJoinAndMapOne('teacher.person', PersonEntity, 'teacherPerson', 'teacher.personId=teacherPerson.id')
			.leftJoinAndMapOne('child.parent', AccountEntity, 'parentAccount', 'child.parentId=parentAccount.id')
			.leftJoinAndMapOne('parentAccount.person', PersonEntity, 'parentPerson', 'parentAccount.personId=parentPerson.id')
			.where('child.id=:id', { id })
			.getOneOrFail(),//child
		this.dataSource.getRepository(EvaluationEntity).createQueryBuilder('evaluation')
			.leftJoinAndMapOne('evaluation.goal', GoalEntity, 'goal', 'goal.id=evaluation.goalId')
			.where('goal.childId=:id', { id })
			.andWhere({ evaluationDatetime: newTimeframe })
			.getMany(),//evaluationsNEW
		this.dataSource.getRepository(EvaluationEntity).createQueryBuilder('evaluation')
			.leftJoinAndMapOne('evaluation.goal', GoalEntity, 'goal', 'goal.id=evaluation.goalId')
			.where('goal.childId=:id', { id })
			.andWhere({ evaluationDatetime: originTimeframe })
			.getMany(),//evaluationsORIGIN
		this.dataSource.getRepository(GoalEntity)//goalsNEW also its activities
			.find({
				relations: ['activity'], where: {
					childId: id, state: Not('strength'),
					assignDatetime: newTimeframe
				}
			}),
		this.dataSource.getRepository(GoalEntity)//goalsORIGIN
			.find({
				where: {
					childId: id, state: Not('strength'),
					assignDatetime: originTimeframe
				}
			}),
		this.dataSource.getRepository(GoalEntity)//strengthsNEW
			.find({ relations: ['activity'], where: { childId: id, state: 'strength', assignDatetime: newTimeframe } }),
		this.dataSource.getRepository(GoalEntity)//strengthsORIGIN
			.find({ relations: ['activity'], where: { childId: id, state: 'strength', assignDatetime: originTimeframe } })
		]);


		//also called NEW avg evaluations rate
		const avgEvaluationsRate = evaluationsNEW.length == 0 ? 0 : (evaluationsNEW.filter(e => e.rate == 'excellent').length / evaluationsNEW.length) * 100;
		//also called ORIGIN avg evaluations rate
		const oldAvgEvaluationsRate = evaluationsORIGIN.length == 0 ? 0 : (evaluationsORIGIN.filter(e => e.rate == 'excellent').length / evaluationsORIGIN.length) * 100;
		const evaluationsCount = evaluationsNEW.length;
		const oldEvaluationsCount = evaluationsORIGIN.length;

		const goalsCount: number = goalsNEW.length;
		const oldGoalsCount: number = goalsORIGIN.length;
		/** CompletedGoals / totalGoals */
		const avgGoalsRate: number = goalsNEW.length == 0 ? 0 : (goalsNEW.filter(g => g.state == 'completed').length / goalsNEW.length) * 100;
		const oldAvgGoalsRate: number = goalsORIGIN.length == 0 ? 0 : (goalsORIGIN.filter(g => g.state == 'completed').length / goalsORIGIN.length) * 100;
		const strengthsCount: number = strengthsNEW.length;
		const oldStrengthsCount: number = strengthsORIGIN.length;
		const goalsStrengthsCount: number = goalsNEW.length + strengthsNEW.length;
		const oldGoalsStrengthsCount: number = goalsORIGIN.length + strengthsORIGIN.length;
		/** (CompletedGoals + totalStrengths) / (totalGoals + totalStrengths) */
		const avgGoalsStrengthsRate: number = (goalsStrengthsCount == 0) ? 0 : (goalsNEW.filter(g => g.state == 'completed').length + strengthsCount) / goalsStrengthsCount * 100;
		const oldAvgGoalsStrengthsRate: number = (oldGoalsStrengthsCount == 0) ? 0 : (goalsORIGIN.filter(g => g.state == 'completed').length + oldStrengthsCount) / oldGoalsStrengthsCount * 100;
		//we let the frontend developer calculate the change by this formula: (NEW - ORIGIN)/ORIGIN


		const completedCount = goalsNEW.filter(v => v.state == 'completed').length;
		const continualCount = goalsNEW.filter(v => v.state == 'continual').length;

		//to reduce payload weight
		const evaluations = evaluationsNEW.map(v => ({ evaluationDatetime: v.evaluationDatetime, rate: v.rate }))
		return {
			child,
			evaluation: {
				evaluationsCount,
				oldEvaluationsCount,
				avgEvaluationsRate,
				oldAvgEvaluationsRate,
				evaluations,
			},
			goal: {
				goals: goalsNEW,
				completedCount,
				continualCount,
				goalsCount,
				oldGoalsCount,
				avgGoalsRate,
				oldAvgGoalsRate,
				goalsStrengthsCount,
				oldGoalsStrengthsCount,
				avgGoalsStrengthsRate,
				oldAvgGoalsStrengthsRate,
			},
			strength: {
				strengths: strengthsNEW,
				strengthsCount,
				oldStrengthsCount,
			},
		};
	}
}
