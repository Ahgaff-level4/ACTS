
// export type TableName = 'person' | 'personView' | 'account' | 'accountView' | 'parent' | 'teacher' |
// 	'hd' | 'child' | 'childView' | 'teacher_child' | 'program' |
// 	'programView' | 'field' | 'fieldView' | 'activity' | 'goal' | 'evaluation';
/**
 * evaluation's rate won't change GoalState. It's another rate/evaluation
 */
export type EvaluationRate = 'continual' | 'excellent';
export type GoalState = 'continual' | "strength" | "completed";
export type Gender = 'Male' | 'Female';
/**
 * Used to check in the frontend. Ex: if action is `login` then open login form.
 * Reason: Error message may change. Action is static.
 */
export type Action = '' | 'login' | 'privilege';



export interface ErrorResponse {
	/** false dah */
	success: boolean;
	message: any;
	msg: any;
	action: any;
	sqlMessage: any;
	error: {
		statusCode: number;
		exception: any;
		timestamp: string;
	};

}

export interface SuccessResponse {
	/** true dah */
	success: boolean;
	data: any;
	/** if success false there will be a message */
	message?: string;
}

/** success response of findOne/findAll request */
export interface SucResFind {
	success: boolean;
	/** for findOne by id then max length is one. Or zero -empty array- for not found*/
	data: ITableEntity[]//Entity
}

export type Role = 'Admin' | 'HeadOfDepartment' | 'Teacher' | 'Parent';

/**
 * User object that stored in request.session.user
 */
export interface User {
	isLoggedIn: boolean;
	accountId: number;
	username: string;
	/** account.person.name */
	name: string;
	roles: Role[];
	address?: string;
	/**max length is 10 or 0 for not parent */
	phones: string[];
	birthdate: string;
	person: IPersonEntity;
}

export interface ILoginInfo {
	username: string;
	password: string;
}

export interface ICreateAccount {
	username: string;//!Account
	password: string;//!Account
	personId: number;//!Account
	address?: string;//!Parent
	phone0?: string;//!Parent
	phone1?: string;//!Parent
	phone2?: string;//!Parent
	phone3?: string;//!Parent
	phone4?: string;//!Parent
	phone5?: string;//!Parent
	phone6?: string;//!Parent
	phone7?: string;//!Parent
	phone8?: string;//!Parent
	phone9?: string;//!Parent
	[key: string]: any;
	roles: Role[];
}
export interface IAccountEntity extends ICreateAccount {
	id: number;
	person: IPersonEntity;//!Account
	rolesEntities: IRoleEntity[];//!All roles
	children: IChildEntity[];//!Parent
	evaluations: IEvaluationEntity[];//!Teacher
	goals: IGoalEntity[];//!Teacher
	teaches: IChildEntity[];//!Teacher
}

export interface IChangePassword {
	oldPassword: string;
	/**the new password */
	password: string;
}

export interface ICreateChild {
	femaleFamilyMembers?: number | null;
	maleFamilyMembers?: number | null;
	birthOrder?: number | null;
	parentsKinship?: string | null;
	diagnosticDate?: Date | string | null;
	pregnancyState?: string | null;
	birthState?: string | null;
	growthState?: string | null;
	diagnostic?: string | null;
	medicine?: string | null;
	behaviors?: string | null;
	prioritySkills?: string | null;
	/** Default is false (i.e., NOT archive) */
	isArchive?: boolean | null;
	parentId?: number | null;
	personId: number;
	programId?: number;
}

export interface IChildEntity extends ICreateChild {
	id: number;
	parent?: IAccountEntity | null;
	person: IPersonEntity;
	goals: IGoalEntity[];
	strengths: IStrengthEntity[];
	teachers: IAccountEntity[];
	program?: IProgramEntity;
	familyMembers?: number | null;
	/** registerDate: (is person.createdDatetime) */
}

export interface ICreateEvaluation {
	description: string;
	mainstream?: string;
	note?: string;
	evaluationDatetime: Date;
	rate: EvaluationRate;
	goalId: number;
	teacherId: number;
}
export interface IEvaluationEntity extends ICreateEvaluation {
	id: number;
	goal: IGoalEntity;
	teacher: IAccountEntity;
}


export interface ICreatePerson {
	name: string;
	birthDate?: string | null;
	gender: Gender;
	createdDatetime: Date;
}

export interface IPersonEntity extends ICreatePerson {
	id: number;
	image?: string;
}

export interface ICreateStrength {
	note?: string;
	assignDatetime: Date;
	activityId: number;
	childId: number;
	teacherId: number;
}

export interface IStrengthEntity extends ICreateStrength {
	id: number;
	activity: IActivityEntity;
	child: IChildEntity;
	evaluations: IEvaluationEntity[];
	teacher: IAccountEntity;
}

export interface ICreateGoal extends ICreateStrength {
	state: GoalState;
}

export interface IGoalEntity extends ICreateGoal, IStrengthEntity {

}

export interface ICreateActivity {
	name: string;
	minAge?: number;
	maxAge?: number;
	fieldId?: number;
	programId?: number;
	createdDatetime?: Date;
}

export interface IActivityEntity extends ICreateActivity {
	id: number;
	program?: IProgramEntity;
	field?: IFieldEntity;
	goals: IGoalEntity[];
}


export interface ICreateField {
	name: string;
	createdDatetime?: Date;
}

export interface IFieldEntity extends ICreateField {
	id: number;
	activities: IActivityEntity[];
	activityCount: number;
}

export interface ICreateProgram {
	name: string;
	createdDatetime?: Date;
}

export interface IProgramEntity extends ICreateProgram {
	id: number;
	activities: IActivityEntity[];
	activityCount: number;
}

export interface IRoleEntity {
	id: number;
	name: Role;
	accounts: IAccountEntity[]
}

export type ITableEntity = IProgramEntity | IFieldEntity | IActivityEntity
	| IGoalEntity | IPersonEntity | IEvaluationEntity | IChildEntity | IAccountEntity;

/**Success Response of edit/delete methods (DELETE, PATCH) */
export interface SucResEditDel {
	generatedMaps?: any[],
	raw?: any[],
	/**Usually value is `1` because there is one raw affected. dah */
	affected: number

}

/**todo notification should not send to all users:
 * - if parent get a notification of new goal then indeed that goal have been added to one of the parent's children.
 * - if teacher ... then ... have been added to one of his teaching children.
 * - if Admin/HeadOfDepartment ... then it means nothing only system's data changed.
*/
export interface INotification {
	by: User;
	method: 'POST' | 'DELETE' | 'PATCH' | 'PUT' | null;
	controller: 'account' | 'activity' | 'child' | 'evaluation' | 'field' | 'goal' | 'backup' | 'restore' | 'program' | 'login' | 'logout' | 'strength';
	/**id of the posted/deleted/patched/putted entity */
	payloadId: number;
	payload: any;
	datetime: string | Date;

}

export type TimeframeDuration = 'All Time' | 'Yearly' | 'Monthly' | 'Weekly';

export interface CustomTimeframe {
	from: string | Date,
	to: string | Date,
}

/** HOW TO CALCULATE IMPROVEMENT/CHANGE RATE:
 * To show the change of goals/evaluations...etc within a timeframe (start date (from), end date (to)).
 * We need an old/origin value and a new/current value, new is the current value so if the average evaluations within X timeframe is 50% then it is what we call NEW.
 * Then what is the old/origin, will let have an example of change rate in Gold prices.
 * We can't say how the Gold price rise unless we have the old Gold price.
 * But when it comes to the change in the average evaluations rate what will be the old/origin average evaluations rate?
 * Let have an example:
 * If user chose timeframe such as January (from: 1/1, to: 1/31) 
 * then we will compare the evaluations of January to the evaluations of December 2022.
 * Why? because to compare an improvement/change we should have base to compare to, 
 * and the base timeframe from a chosen timeframe can not be static, it won't be helpful.
 * So, we can't say for example the evaluations in this week improved unless we compare it with the previous week.
 * To do this in an arbitrary timeframe such as from: 5/13, to: 7/29 (not static such as Week/Month...etc).
 * We first will get all evaluations within the NEW timeframe.
 * The OLD/ORIGIN timeframe is the past mirrored of the user's chosen timeframe;
 * the past mirror of a timeframe can be easily understand as below:
 * February => ~January (Past mirror of January).
 * This week => Last week.
 * from:2/20, to:2/30 => from:2/10, to:2/20.
 * Note: past mirror is made up term :)
 * to calculate a past mirror from a timeframe we do the following (Pseudocode):
 * ```pseudocode
 * //user chosen timeframe
 * NewFrom = 4/20;
 * NewTo   = 4/25;
 * daysDuration = NewTo - NewFrom;// 5 days
 * OriginFrom = NewFrom - daysDuration;// 4/15
 * OriginTo = NewFrom;// 4/20
 * ```
 * To get the improvement/change of average evaluations rate after we get the evaluations within NEW timeframe and ORIGIN timeframe:
 * Calculate the NEW and ORIGIN rate by dividing number Of excellent evaluations over the number of evaluations:
 * ```javascript
 * rate = numberOfExcellentEvaluations / numberOfEvaluations;
 * ```
 * Finally after we get NEW rate and ORIGIN rate we calculate the improvement/change rate as following:
 * ```javascript
 * //improvement/change formula: (new - origin) / origin * 100; You can use this to calculate the raise of Gold price :)
 * changeRate = (NewRate - OriginRate) / OriginRate * 100;
 * ```
 */
export interface IChildReport {
	//some properties can be drive from the same object such as `goalsCount=completedCount+continualCount` but for the sake of simplicity and readability we ignore that
	child: IChildEntity;
	evaluation: {
		evaluationsCount: number,
		/** old is used to calculate the change as: (evaluationsCount - oldEvaluationsCount) / oldEvaluationsCount. old is the evaluations within past mirror of chosen timeframe so if timeframe is February then past mirror(old) is January evaluations  */
		oldEvaluationsCount: number,
		/**ExcellentEvaluations / TotalEvaluations. Within the chosen timeframe*/
		avgEvaluationsRate: number,
		/** old is used to calculate the change as: (newEvaluationsRatePercent - oldEvaluationsRatePercent) / oldEvaluationsRatePercent. old is the evaluations within past mirror of chosen timeframe so if timeframe is February then past mirror(old) is January evaluations  */
		oldAvgEvaluationsRate: number,
		evaluations: {
			rate: IEvaluationEntity['rate'],
			evaluationDatetime: IEvaluationEntity['evaluationDatetime'],
		}[]
	},
	goal: {
		goals: IGoalEntity[],
		completedCount: number,
		continualCount: number,
		goalsCount: number,
		oldGoalsCount: number,
		/** CompletedGoals / totalGoals */
		avgGoalsRate: number,
		oldAvgGoalsRate: number,
		goalsStrengthsCount: number,
		oldGoalsStrengthsCount: number,
		/** (CompletedGoals + totalStrengths) / (totalGoals + totalStrengths) */
		avgGoalsStrengthsRate: number,
		oldAvgGoalsStrengthsRate: number,
	},
	strength: {
		strengths: IStrengthEntity[],
		strengthsCount: number,
		oldStrengthsCount: number,
	},
}

//private used below
interface ACCOUNTS {
	all: number;
	admin: number;
	headOfDepartment: number;
	teacher: number;
	parent: number;
}
//private used below
interface CHILDREN {
	children: IChildEntity[];
	childrenNotArchive: number;
	childrenArchive: number;
}

//private used below
interface COUNT {
	programs: number;
	fields: number;
	accounts: ACCOUNTS;
	completedGoals: number;
	continualGoals: number;
	strengths: number;
	activities: number;
	evaluations: number;
	specialActivities: number;
}
interface COUNT_TIMEFRAME {
	children: CHILDREN;
	programs: number;
	fields: number;
	accounts: ACCOUNTS;
	completedGoals: number;
	continualGoals: number;
	strengths: number;
	activities: number;
	evaluations: number;
	specialActivities: number;

}
//private used below
interface COUNT_ALL_TIME extends COUNT {
	children: Omit<CHILDREN, 'children'>
}

/**all time is all time and timeframe is number of entities within the timeframe */
export interface IDashboard {
	allTime: COUNT_ALL_TIME;
	timeframe: COUNT_TIMEFRAME;
}

export interface NotificationMessage {
	from: User,
	/**`null` means it is broadcast notification message */
	to: User | null,
	text: string;
}

export type ITimelineEvent = {
	state: 'goal' | 'evaluation' | 'child' | 'strength';
} & ({
	state: 'child';
	child: IChildEntity;
}
	| {
		state: 'goal';
		goal: IGoalEntity;
	} | {
		state: 'evaluation';
		evaluation: IEvaluationEntity;
	} | {
		state: 'strength';
		strength: IStrengthEntity;
	})
