/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { PersonEntity } from '../person/person.entity';
import { GoalEntity } from '../goal/goal.entity';
import { ActivityEntity } from '../activity/activity.entity';
import { AccountEntity } from '../account/account.entity';
import { ITimelineEvent } from '../../../../interfaces';
import { EvaluationEntity } from '../evaluation/evaluation.entity';
import { ChildEntity } from '../child/child.entity';

@Injectable()
export class OtherService {

	constructor(@InjectDataSource() private dataSource: DataSource) { }

	async allTimeline(take: number, skip: number): Promise<ITimelineEvent[]> {
		let ret:ITimelineEvent[] = [];
		const [children, strengths, goals, evaluations] = await Promise.all([
			this.dataSource.createQueryBuilder(ChildEntity, 'child')
				.leftJoinAndMapOne('child.person', PersonEntity, 'person', 'child.personId=person.id')
				.leftJoinAndSelect('child.teachers', 'teacher')
				.leftJoinAndMapOne('teacher.person', PersonEntity, 'teacherPerson', 'teacher.personId=teacherPerson.id')
				.orderBy('person.createdDatetime', 'DESC')
				.take(take).skip(skip).getMany(),
			this.dataSource.createQueryBuilder(GoalEntity, 'strength')
				.leftJoinAndMapOne('strength.activity', ActivityEntity, 'strengthActivity', "strength.activityId=strengthActivity.id")
				.leftJoinAndMapOne('strength.teacher', AccountEntity, 'strengthTeacher', "strength.teacherId=strengthTeacher.id")
				.leftJoinAndMapOne('strengthTeacher.person', PersonEntity, 'strengthTeacherPerson', "strengthTeacher.personId=strengthTeacherPerson.id")
				.leftJoinAndMapOne('strength.child', ChildEntity, 'child', "child.id=strength.childId")
				.leftJoinAndMapOne('child.person', PersonEntity, 'person', 'child.personId=person.id')
				.where('strength.state = :state', { state: 'strength' })
				.orderBy('strength.assignDatetime', 'DESC')
				.take(take).skip(skip).getMany(),
			this.dataSource.createQueryBuilder(GoalEntity, 'goal')
				.leftJoinAndMapOne('goal.activity', ActivityEntity, 'goalActivity', 'goal.activityId = goalActivity.id')
				.leftJoinAndMapOne('goal.teacher', AccountEntity, 'goalTeacher', 'goal.teacherId = goalTeacher.id')
				.leftJoinAndMapOne('goalTeacher.person', PersonEntity, 'goalTeacherPerson', "goalTeacher.personId=goalTeacherPerson.id")
				.leftJoinAndMapOne('goal.child', ChildEntity, 'child', "child.id=goal.childId")
				.leftJoinAndMapOne('child.person', PersonEntity, 'person', 'child.personId=person.id')
				.where('goal.state != :state', { state: 'strength' })
				.orderBy("goal.assignDatetime", "DESC")
				.take(take).skip(skip).getMany(),
			this.dataSource.createQueryBuilder(EvaluationEntity, 'evaluation')
				.leftJoinAndMapOne('evaluation.teacher', AccountEntity, 'evaluationTeacher', "evaluation.teacherId=evaluationTeacher.id")
				.leftJoinAndMapOne('evaluationTeacher.person', PersonEntity, 'evaluationTeacherPerson', "evaluationTeacherPerson.id=evaluationTeacher.personId")
				.leftJoinAndMapOne('evaluation.goal', GoalEntity, 'goal', 'evaluation.goalId=goal.id')
				.leftJoinAndMapOne('goal.activity', ActivityEntity, 'goalActivity', 'goal.activityId = goalActivity.id')
				.leftJoinAndMapOne('goal.child', ChildEntity, 'child', "child.id=goal.childId")
				.leftJoinAndMapOne('child.person', PersonEntity, 'person', 'child.personId=person.id')
				.where('goal.state != :state', { state: 'strength' })
				.orderBy("evaluation.evaluationDatetime", "DESC")
				.take(take).skip(skip).getMany()
		]);
		ret = ret.concat(children.map(v => ({
			state: 'child',
			child: v,
		})));

		ret = ret.concat(strengths.map(v => ({
			state: 'strength',
			strength: v,
		})));

		ret = ret.concat(goals.map(v => ({
			state: 'goal',
			goal: v,
		})));

		ret = ret.concat(evaluations.map(v => ({
			state: 'evaluation',
			evaluation: v,
		})))

		ret = ret.sort(this.sortTimelineEvents);
		if (ret.length > take)
			ret = ret.splice(0, take);
		return ret;
	}


	async parentTimeline(parentId: number, take: number, skip: number): Promise<ITimelineEvent[]> {
		let ret: ITimelineEvent[] = [];
		const [children, strengths, goals, evaluations] = await Promise.all([
			this.dataSource.createQueryBuilder(ChildEntity, 'child')
				.leftJoinAndMapOne('child.person', PersonEntity, 'person', 'child.personId=person.id')
				.leftJoinAndSelect('child.teachers', 'teacher')
				.leftJoinAndMapOne('teacher.person', PersonEntity, 'teacherPerson', 'teacher.personId=teacherPerson.id')
				.where('child.parentId=:parentId', { parentId })
				.orderBy('person.createdDatetime', 'DESC')
				.take(take).skip(skip).getMany(),
			this.dataSource.createQueryBuilder(GoalEntity, 'strength')
				.leftJoinAndMapOne('strength.activity', ActivityEntity, 'strengthActivity', "strength.activityId=strengthActivity.id")
				.leftJoinAndMapOne('strength.teacher', AccountEntity, 'strengthTeacher', "strength.teacherId=strengthTeacher.id")
				.leftJoinAndMapOne('strengthTeacher.person', PersonEntity, 'strengthTeacherPerson', "strengthTeacher.personId=strengthTeacherPerson.id")
				.leftJoinAndMapOne('strength.child', ChildEntity, 'child', "child.id=strength.childId")
				.leftJoinAndMapOne('child.person', PersonEntity, 'person', 'child.personId=person.id')
				.where('child.parentId=:parentId', { parentId })
				.andWhere('strength.state = :state', { state: 'strength' })
				.orderBy('strength.assignDatetime', 'DESC')
				.take(take).skip(skip).getMany(),
			this.dataSource.createQueryBuilder(GoalEntity, 'goal')
				.leftJoinAndMapOne('goal.activity', ActivityEntity, 'goalActivity', 'goal.activityId = goalActivity.id')
				.leftJoinAndMapOne('goal.teacher', AccountEntity, 'goalTeacher', 'goal.teacherId = goalTeacher.id')
				.leftJoinAndMapOne('goalTeacher.person', PersonEntity, 'goalTeacherPerson', "goalTeacher.personId=goalTeacherPerson.id")
				.leftJoinAndMapOne('goal.child', ChildEntity, 'child', "child.id=goal.childId")
				.leftJoinAndMapOne('child.person', PersonEntity, 'person', 'child.personId=person.id')
				.where('child.parentId=:parentId', { parentId })
				.andWhere('goal.state != :state', { state: 'strength' })
				.orderBy("goal.assignDatetime", "DESC")
				.take(take).skip(skip).getMany(),
			this.dataSource.createQueryBuilder(EvaluationEntity, 'evaluation')
				.leftJoinAndMapOne('evaluation.teacher', AccountEntity, 'evaluationTeacher', "evaluation.teacherId=evaluationTeacher.id")
				.leftJoinAndMapOne('evaluationTeacher.person', PersonEntity, 'evaluationTeacherPerson', "evaluationTeacherPerson.id=evaluationTeacher.personId")
				.leftJoinAndMapOne('evaluation.goal', GoalEntity, 'goal', 'evaluation.goalId=goal.id')
				.leftJoinAndMapOne('goal.activity', ActivityEntity, 'goalActivity', 'goal.activityId = goalActivity.id')
				.leftJoinAndMapOne('goal.child', ChildEntity, 'child', "child.id=goal.childId")
				.leftJoinAndMapOne('child.person', PersonEntity, 'person', 'child.personId=person.id')
				.where('child.parentId=:parentId', { parentId })
				.andWhere('goal.state != :state', { state: 'strength' })
				.orderBy("evaluation.evaluationDatetime", "DESC")
				.take(take).skip(skip).getMany()
		]);
		ret = ret.concat(children.map(v => ({
			state: 'child',
			child: v,
		})));

		ret = ret.concat(strengths.map(v => ({
			state: 'strength',
			strength: v,
		})));

		ret = ret.concat(goals.map(v => ({
			state: 'goal',
			goal: v,
		})));

		ret = ret.concat(evaluations.map(v => ({
			state: 'evaluation',
			evaluation: v,
		})))

		ret = ret.sort(this.sortTimelineEvents);
		if (ret.length > take)
			ret = ret.splice(0, take);
		return ret;
	}

	async teacherTimeline(teacherId: number, take: number, skip: number): Promise<ITimelineEvent[]> {
		let ret: ITimelineEvent[] = [];
		const [children, strengths, goals, evaluations] = await Promise.all([
			this.dataSource.createQueryBuilder(ChildEntity, 'child')
				.leftJoinAndMapOne('child.person', PersonEntity, 'person', 'child.personId=person.id')
				.leftJoinAndSelect('child.teachers', 'teacher')
				.leftJoinAndMapOne('teacher.person', PersonEntity, 'teacherPerson', 'teacher.personId=teacherPerson.id')
				.where('teacher.id=:teacherId', { teacherId })
				.orderBy('person.createdDatetime', 'DESC')
				.take(take).skip(skip).getMany(),
			this.dataSource.createQueryBuilder(GoalEntity, 'strength')
				.leftJoinAndMapOne('strength.activity', ActivityEntity, 'strengthActivity', "strength.activityId=strengthActivity.id")
				.leftJoinAndMapOne('strength.teacher', AccountEntity, 'strengthTeacher', "strength.teacherId=strengthTeacher.id")
				.leftJoinAndMapOne('strengthTeacher.person', PersonEntity, 'strengthTeacherPerson', "strengthTeacher.personId=strengthTeacherPerson.id")
				.leftJoinAndMapOne('strength.child', ChildEntity, 'child', "child.id=strength.childId")
				.leftJoinAndMapOne('child.person', PersonEntity, 'person', 'child.personId=person.id')
				.leftJoinAndSelect('child.teachers', 'teacher')
				.where('teacher.id=:teacherId', { teacherId })
				.andWhere('strength.state = :state', { state: 'strength' })
				.orderBy('strength.assignDatetime', 'DESC')
				.take(take).skip(skip).getMany(),
			this.dataSource.createQueryBuilder(GoalEntity, 'goal')
				.leftJoinAndMapOne('goal.activity', ActivityEntity, 'goalActivity', 'goal.activityId = goalActivity.id')
				.leftJoinAndMapOne('goal.teacher', AccountEntity, 'goalTeacher', 'goal.teacherId = goalTeacher.id')
				.leftJoinAndMapOne('goalTeacher.person', PersonEntity, 'goalTeacherPerson', "goalTeacher.personId=goalTeacherPerson.id")
				.leftJoinAndMapOne('goal.child', ChildEntity, 'child', "child.id=goal.childId")
				.leftJoinAndMapOne('child.person', PersonEntity, 'person', 'child.personId=person.id')
				.leftJoinAndSelect('child.teachers', 'teacher')
				.where('teacher.id=:teacherId', { teacherId })
				.andWhere('goal.state != :state', { state: 'strength' })
				.orderBy("goal.assignDatetime", "DESC")
				.take(take).skip(skip).getMany(),
			this.dataSource.createQueryBuilder(EvaluationEntity, 'evaluation')
				.leftJoinAndMapOne('evaluation.teacher', AccountEntity, 'evaluationTeacher', "evaluation.teacherId=evaluationTeacher.id")
				.leftJoinAndMapOne('evaluationTeacher.person', PersonEntity, 'evaluationTeacherPerson', "evaluationTeacherPerson.id=evaluationTeacher.personId")
				.leftJoinAndMapOne('evaluation.goal', GoalEntity, 'goal', 'evaluation.goalId=goal.id')
				.leftJoinAndMapOne('goal.activity', ActivityEntity, 'goalActivity', 'goal.activityId = goalActivity.id')
				.leftJoinAndMapOne('goal.child', ChildEntity, 'child', "child.id=goal.childId")
				.leftJoinAndMapOne('child.person', PersonEntity, 'person', 'child.personId=person.id')
				.leftJoinAndSelect('child.teachers', 'teacher')
				.where('teacher.id=:teacherId', { teacherId })
				.andWhere('goal.state != :state', { state: 'strength' })
				.orderBy("evaluation.evaluationDatetime", "DESC")
				.take(take).skip(skip).getMany()
		]);

		ret = ret.concat(children.map(v => ({
			state: 'child',
			child: v,
		})));

		ret = ret.concat(strengths.map(v => ({
			state: 'strength',
			strength: v,
		})));

		ret = ret.concat(goals.map(v => ({
			state: 'goal',
			goal: v,
		})));

		ret = ret.concat(evaluations.map(v => ({
			state: 'evaluation',
			evaluation: v,
		})))

		ret = ret.sort(this.sortTimelineEvents);
		if (ret.length > take)
			ret = ret.splice(0, take);
		return ret;
	}

	async childTimeline(id: number, take: number, skip: number): Promise<ITimelineEvent[]> {
		const [child, strengths, goals, evaluations] = await Promise.all([this.dataSource.createQueryBuilder(ChildEntity, 'child')
			.leftJoinAndMapOne('child.person', PersonEntity, 'person', 'child.personId=person.id')
			// .leftJoinAndSelect('child.teachers', 'teachers')//child timeline do not needs teachers
			.where('child.id=:id', { id })
			.getOneOrFail(),
		this.dataSource.createQueryBuilder(GoalEntity, 'strength')
			.leftJoinAndMapOne('strength.activity', ActivityEntity, 'strengthActivity', "strength.activityId=strengthActivity.id")
			.leftJoinAndMapOne('strength.teacher', AccountEntity, 'strengthTeacher', "strength.teacherId=strengthTeacher.id")
			.leftJoinAndMapOne('strengthTeacher.person', PersonEntity, 'strengthTeacherPerson', "strengthTeacher.personId=strengthTeacherPerson.id")
			.where('strength.childId = :id', { id })
			.andWhere('strength.state = :state', { state: 'strength' })
			.orderBy('strength.assignDatetime', 'DESC')
			.take(take).skip(skip).getMany(),
		this.dataSource.createQueryBuilder(GoalEntity, 'goal')
			.leftJoinAndMapOne('goal.activity', ActivityEntity, 'goalActivity', 'goal.activityId = goalActivity.id')
			.leftJoinAndMapOne('goal.teacher', AccountEntity, 'goalTeacher', 'goal.teacherId = goalTeacher.id')
			.leftJoinAndMapOne('goalTeacher.person', PersonEntity, 'goalTeacherPerson', "goalTeacher.personId=goalTeacherPerson.id")
			.where("goal.childId = :id", { id })
			.andWhere('goal.state != :state', { state: 'strength' })
			.orderBy("goal.assignDatetime", "DESC")
			.take(take).skip(skip).getMany(),
		this.dataSource.createQueryBuilder(EvaluationEntity, 'evaluation')
			.leftJoinAndMapOne('evaluation.teacher', AccountEntity, 'evaluationTeacher', "evaluation.teacherId=evaluationTeacher.id")
			.leftJoinAndMapOne('evaluationTeacher.person', PersonEntity, 'evaluationTeacherPerson', "evaluationTeacherPerson.id=evaluationTeacher.personId")
			.leftJoinAndMapOne('evaluation.goal', GoalEntity, 'goal', 'evaluation.goalId=goal.id')
			.leftJoinAndMapOne('goal.activity', ActivityEntity, 'goalActivity', 'goal.activityId = goalActivity.id')
			.where("goal.childId = :id", { id })
			.andWhere('goal.state != :state', { state: 'strength' })
			.orderBy("evaluation.evaluationDatetime", "DESC")
			.take(take).skip(skip).getMany()]);

		let ret: ITimelineEvent[] = strengths.map(v => {
			v.child = child
			return {
				state: 'strength',
				strength: v,
			}
		});

		ret = ret.concat(goals.map(g => {
			g.child = child;
			return {
				state: 'goal',
				goal: g,
			}
		}));

		ret = ret.concat(evaluations.map(v => {
			v.goal.child = child;
			return {
				state: 'evaluation',
				evaluation: v,
			}
		}
		));

		ret = ret.sort(this.sortTimelineEvents);

		if (ret.length > take)
			ret = ret.splice(0, take);
		return ret;
	}

	sortTimelineEvents = (a: ITimelineEvent, b: ITimelineEvent): number => {
		let d1: Date, d2: Date;
		if (a.state == 'evaluation')
			d1 = a.evaluation.evaluationDatetime;
		else if (a.state == 'goal' || a.state == 'strength')
			d1 = a.state == 'goal' ? a.goal.assignDatetime : a.strength.assignDatetime;
		else if (a.state == 'child')
			d1 = a.child.person.createdDatetime;
		else throw 'unexpected timeline event state value. state=' + (a as any).state;

		if (b.state == 'evaluation')
			d2 = b.evaluation.evaluationDatetime;
		else if (b.state == 'goal' || b.state == 'strength')
			d2 = b.state == 'goal' ? b.goal.assignDatetime : b.strength.assignDatetime;
		else if (b.state == 'child')
			d2 = b.child.person.createdDatetime;
		else throw 'unexpected timeline event state value. state=' + (b as any).state;

		return new Date(d1) > new Date(d2) ? -1 : (new Date(d1) < new Date(d2) ? 1 : 0);
	}
}
