/* eslint-disable prefer-const */
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { Between, DataSource, Not } from 'typeorm';
import { IChildReport, IDashboard } from '../../../../interfaces';
import { ChildEntity } from '../child/child.entity';
import { ProgramEntity } from '../program/program.entity';
import { FieldEntity } from '../field/field.entity';
import { AccountEntity } from '../account/account.entity';
import { GoalEntity } from '../goal/Goal.entity';
import { PersonEntity } from '../person/person.entity';
import { EvaluationEntity } from '../evaluation/evaluation.entity';

@Injectable()
export class ReportService {
	constructor(@InjectDataSource() private dataSource: DataSource) { }

	public async dashboard(from: Date | string, to: Date | string): Promise<IDashboard> {

		const children = (await this.dataSource.getRepository(ChildEntity)
			.find({ relations: ['person'], where: { isArchive: false, person: { createdDatetime: Between(new Date(from), new Date(to)) } } })
		);

		const childrenCount = (await this.dataSource.getRepository(ChildEntity).countBy({ isArchive: false }))

		//counts
		const numOfChildren = (await this.dataSource.getRepository(ChildEntity).count({
			relations: ['person'], where: { person: { createdDatetime: Between(new Date(from), new Date(to)) } }
		}));
		const numOfPrograms = (await this.dataSource.getRepository(ProgramEntity).countBy({ createdDatetime: Between(new Date(from), new Date(to)) }));
		const numOfFields = (await this.dataSource.getRepository(FieldEntity).countBy({ createdDatetime: Between(new Date(from), new Date(to)) }));
		const numOfAccounts = (await this.dataSource.getRepository(AccountEntity).count({
			relations: ['person'], where: { person: { createdDatetime: Between(new Date(from), new Date(to)) } }
		}));
		const numOfCompletedGoals = (await this.dataSource.getRepository(GoalEntity).countBy({ state: 'completed', assignDatetime: Between(new Date(from), new Date(to)) }));
		const numOfContinualGoals = (await this.dataSource.getRepository(GoalEntity).countBy({ state: 'continual', assignDatetime: Between(new Date(from), new Date(to)) }));

		return {
			children, childrenCount, counts: {
				programs: numOfPrograms,
				accounts: numOfAccounts,
				children: numOfChildren,
				fields: numOfFields,
				completedGoals: numOfCompletedGoals,
				continualGoals: numOfContinualGoals,
			}
		}
	}

	public async childReport(id: number, from: Date | string, to: Date | string): Promise<IChildReport> {
		const child = (await this.dataSource.getRepository(ChildEntity)
			.createQueryBuilder('child')
			.leftJoinAndMapOne('child.person', PersonEntity, 'person', 'child.personId=person.id')
			.leftJoinAndSelect('child.teachers', 'teacher')
			.leftJoinAndMapOne('teacher.person', PersonEntity, 'teacherPerson', 'teacher.personId=teacherPerson.id')
			.leftJoinAndMapOne('child.parent', AccountEntity, 'parentAccount', 'child.parentId=parentAccount.id')
			.leftJoinAndMapOne('parentAccount.person', PersonEntity, 'parentPerson', 'parentAccount.personId=parentPerson.id')
			.where('child.id=:id', { id })
			.getMany())[0];

		const goals = await this.dataSource.getRepository(GoalEntity)
			.find({ relations: ['activity'], where: { childId: id, state: Not('strength'), assignDatetime: Between(new Date(from), new Date(to)) } });
		// .createQueryBuilder('goal')
		// .leftJoinAndMapOne('goal.activity', ActivityEntity, 'activity', "goal.activityId=activity.id")
		// .leftJoinAndSelect('goal.evaluations', 'evaluation')
		// .where({
		// 	childId: id, state: Not('strength'), assignDatetime: Between(new Date(from), new Date(to)),
		// 	evaluations: {}
		// })
		// .getMany(); Got error `cannot query one-to-many for property evaluations`

		const strengths = await this.dataSource.getRepository(GoalEntity)
			.find({ relations: ['activity'], where: { childId: id, state: 'strength', assignDatetime: Between(new Date(from), new Date(to)) } });

		const completedCount = goals.filter(v => v.state == 'completed').length;
		const continualCount = goals.filter(v => v.state == 'continual').length;

		/** HOW TO CALCULATE EACH GOAL IMPROVEMENT RATE:
		 * Each goal should has numbered rate, the number will show the improvement of the goal base on its evaluations within time span (start date (from), end date (to)).
		 * To do that we will make two groups of the goal's evaluations, ORIGIN group and NEW group.
		 * We divide the goal's evaluations into two groups so that we can get a rate (percentage).
		 * If user chose time span such as January (from: 1/1, to: 1/31) 
		 * then we will compare the evaluations of January to the evaluations of December 2022.
		 * Why? because to compare an improvement we should have base to compare to, 
		 * we can't say how the Gold price rise unless we have the old Gold price.
		 * So, we can't say the evaluations in this week improved unless we compare it with the previous week.
		 * To do this in an arbitrary time span such as from: 5/13, to: 7/29 (not static such as Week/Month...etc).
		 * We first will get all evaluations within this time span, which will be the NEW group.
		 * NEW group is array of evaluations that occur within the user's chosen time span.
		 * ORIGIN group is array of evaluations that occur within the past mirrored of the user's chosen time span;
		 * the past mirror of a time span can be easily understand as below:
		 * February => January (Past mirror of January).
		 * This week => Last week.
		 * from:2/20, to:2/30 => from:2/10, to:2/20.
		 * Note: past mirror is made up term :)
		 * to calculate a past mirror from a time span we do the following (Pseudocode):
		 * //user chosen time span
		 * NewFrom = 4/20;
		 * NewTo   = 4/25;
		 * daysDuration = NewTo - NewFrom;// 5 days
		 * OriginFrom = NewFrom - daysDuration;// 4/15
		 * OriginTo = NewFrom;// 4/20
		 * -------------------------------------------------
		 * To get the improvement rate of a goal we do the following with ORIGIN and NEW evaluations:
		 * calculate the NEW/ORIGIN rate by dividing number Of excellent evaluations over the number of evaluations
		 * rate = numberOfExcellentEvaluations / numberOfEvaluations;
		 * Finally after we get NEW rate and ORIGIN rate we calculate the goal rate:
		 * goal rate is a percentage calculated as:
		 * //improvement formula: (new - origin) / origin * 100; You can use this to calculate the raise of Gold price :)
		 * goalImprovementRate = (NewRate - OriginRate) / OriginRate * 100;
		 */

		// const goalNewEvaluation = await this.dataSource.getRepository(EvaluationEntity)
		// 	.find({ where: { goalId: goals[0].id, evaluationDatetime: Between(new Date(from), new Date(to)) } })
		let promises: Promise<EvaluationEntity[]>[] = [];
		for (let goal of goals) {
			let newFrom = new Date(from);
			let newTo = new Date(to);
			let durationSpan = newTo.getTime() - newFrom.getTime();//duration in millisecond
			let originFrom = new Date(newFrom.getTime() - durationSpan);
			let originTo = newFrom;
			promises.push(this.dataSource.getRepository(EvaluationEntity)
				.find({ where: { goalId: goal.id, evaluationDatetime: Between(newFrom, newTo) } }));
			promises.push(this.dataSource.getRepository(EvaluationEntity)
				.find({ where: { goalId: goal.id, evaluationDatetime: Between(originFrom, originTo) } }))
		}
		const promisesResult = await Promise.all(promises);


		// const newEvaluations = await Promise.all(
		// goals.map((v:IChildReport['goalStrength']['goals'][0] & {newEvaluations:IEvaluationEntity[],originEvaluations:IEvaluationEntity[]})=>{

		// });
		// )
		let goalsWithRate = goals.map((goal: IChildReport['goalStrength']['goals'][0], i) => {
			//promisesResult is array goals's evaluations. And it is double the length of goals;
			//each goal has two group NEW and ORIGIN evaluations, and they are located as:
			//goal[0]'s NEW group is promisesResult[0] and ORIGIN is promisesResult[1]
			//goal[1]'s NEW group is promisesResult[2] and ORIGIN is promisesResult[3]
			//formula:
			//goal[x]'s NEW group is promisesResult[x*2],  ORIGIN is promisesResult[x*2+1]
			let newGroup = promisesResult[i * 2];
			let originGroup = promisesResult[i * 2 + 1];
			let newRate = 0;
			let originRate = 0;

			if (newGroup.length > 0)//avoid dividing over zero
				newRate = newGroup.filter(v => v.rate == 'excellent').length / newGroup.length;

			if (originGroup.length > 0)
				originRate = originGroup.filter(v => v.rate == 'excellent').length / originGroup.length;

			goal.improveRate = 0;
			if (originRate > 0)
				goal.improveRate = ((newRate - originRate) / originRate) * 100;
			return goal;
		})


		return { child, goal: { completedCount, continualCount }, goalStrength: { goals: goalsWithRate, strengths }, };
	}
}
