


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



export interface GeneralResponse {
	success: boolean;
	data: any;
}
export interface ErrorResponse {
	/** false dah */
	success: boolean;
	message: string;
	action: string;//Action
	error: {
		statusCode: number;
		exception: any;
		/** ISO date string */
		timestamp: string;
	}
}
export interface SuccessResponse {
	/** true dah */
	success: boolean;
	data: any;
}
/** success response of findOne/findAll request */
export interface SucResFind {
	success: boolean;
	/** for findOne by id then max length is one. Or zero -empty array- for not found*/
	data: object[]//Entity
}

export type Role = 'Admin' | 'HeadOfDepartment' | 'Teacher' | 'Parent';


export interface ICreateAccount {
	username: string;
	password: string;
	personId: number;
}
export interface IAccountEntity extends ICreateAccount {
	id: number;
	person: PersonEntity;
}

export interface ICreateChild {
	femaleFamilyMembers?: number;
	maleFamilyMembers?: number;
	birthOrder?: number;
	parentsKinship?: string;
	diagnosticDate?: Date | string;
	pregnancyState?: string;
	birthState?: string;
	growthState?: string;
	diagnostic?: string;
	medicine?: string;
	behaviors?: string;
	prioritySkills?: string;
	/** Default is false (NOT archive) */
	isArchive?: boolean;
	parentId?: number;
	personId: number;
}

export interface IChildEntity extends ICreateChild {
	id: number;
	parent?: ParentEntity;
	person: IPersonEntity;
	goals: IGoalEntity[];
	familyMembers?: number;
	durationSpent: number;
	/** registerDate is person.createdDatetime */
	registerDate: Date;
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
	teacher: ITeacherEntity;
}

export interface ICreateField {
	name: string;
	createdDatetime: Date;
}

export interface IFieldEntity extends ICreateField {
	id: number;
	activityCount: number;
}

export interface ICreatePerson {
	name: string;
	birthDate?: string;
	gender:Gender;
	createdDatetime?: Date;
}

export interface IPersonEntity extends ICreatePerson {
	id: number;
	age: number;
}

export interface ICreateGoal {
	public note?: string;
	public assignDatetime?: Date;
	public state: GoalState;
	public activityId: number;
	public childId: number;
	public teacherId: number;
}

export interface IGoalEntity extends ICreateGoal {
	public id: number;
	public activity: IActivityEntity;
	public child: IChildEntity;
	public evaluations: IEvaluationEntity[];
	public teacher: ITeacherEntity;
}

export interface ICreateActivity {
	public name: string;
	public minAge?: number;
	public maxAge?: number;
	public fieldId?: number;
	public programId?: number;
	public createdDatetime?: Date;
}

export interface IActivityEntity extends ICreateActivity {
	public id: number;
	public program?: IProgramEntity;
	public field?: IFieldEntity;
	public goals: IGoalEntity[];
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

export interface IRoleEntity{
	public id: number;
	public name: Role;
	public accounts: IAccountEntity[]
}