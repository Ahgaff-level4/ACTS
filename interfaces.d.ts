import { HttpException } from './backend-nest/node_modules/@nestjs/common';



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
		exception: HttpException;
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
	/** account.person.name */
	name: string;
	roles: Role[];
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
	parent?: IAccountEntity|null;
	person: IPersonEntity;
	goals: IGoalEntity[];
	teachers: IAccountEntity[];
	familyMembers?: number|null;
	durationSpent: number;
	/** registerDate is person.createdDatetime */
	// registerDate: Date;
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
	birthDate?: string|null;
	gender: Gender;
	createdDatetime: Date;
}

export interface IPersonEntity extends ICreatePerson {
	id: number;
	age: number|null;
}

export interface ICreateGoal {
	note?: string;
	assignDatetime?: Date;
	state: GoalState;
	activityId: number;
	childId: number;
	teacherId: number;
}

export interface IGoalEntity extends ICreateGoal {
	id: number;
	activity: IActivityEntity;
	child: IChildEntity;
	evaluations: IEvaluationEntity[];
	teacher: IAccountEntity;
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