
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
}

export interface IChildEntity extends ICreateChild {
	id: number;
	parent?: IAccountEntity | null;
	person: IPersonEntity;
	goals: IGoalEntity[];
	strengths: IStrengthEntity[];
	teachers: IAccountEntity[];
	familyMembers?: number | null;
	/** registerDate: (is person.createdDatetime) */
}

export interface ICreateEvaluation {
	description: string;
	mainstream?: string;
	note?: string;
	evaluationDatetime?: Date;
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
}

export interface ICreateStrength {
	note?: string;
	assignDatetime?: Date;
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

export interface IChildReport {
	child: IChildEntity;
	goal: { completedCount: number, continualCount: number },

}

export type Timeframe = 'All Time' | 'Yearly' | 'Monthly' | 'Weekly';

/**todo notification should not send to all users:
* - if parent get a notification of new goal then indeed that goal have been added to one of the parent's children.
* - if teacher ... then ... have been added to one of his teaching children.
* - if Admin/HeadOfDepartment ... then it means nothing only system's data changed.
*/
export interface INotification {
	by: User;
	method: 'POST' | 'DELETE' | 'PATCH' | 'PUT'|null;
	controller: 'account' | 'activity' | 'child' | 'evaluation' | 'field' | 'goal' | 'backup' | 'restore' | 'program' | 'login'|'logout'|'strength';
	/**id of the posted/deleted/patched/putted entity */
	payloadId: number;
	payload: any;
	datetime: string | Date;
}