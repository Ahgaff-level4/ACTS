


export type TableName = 'person' | 'personView' | 'account' | 'accountView' | 'parent' | 'teacher' |
	'hd' | 'child' | 'childView' | 'teacher_child' | 'program' |
	'programView' | 'field' | 'fieldView' | 'performance' | 'goal' | 'evaluation';


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
	parentId?: number;
	personId: number;
}

export interface IChildEntity extends ICreateChild {
	id: number;
	parent?: ParentEntity;
	person: PersonEntity;
	/** registerDate is person.createdDatetime */
	registerDate: Date | string;
}

export interface ICreateEvaluation {
	description: string;
	mainstream?: string;
	note?: string;
	evaluationDatetime: Date | string;
	goalId: number;
	teacherId: number;
}
export interface IEvaluationEntity extends ICreateEvaluation {
	id: number;
	goal: GoalEntity;
	teacher?: TeacherEntity;
}

export interface ICreateField{
	name:string;
	createdDatetime:Date|string;
}

export interface IFieldEntity extends ICreateField {
	id:number;
	performanceCount:number;
}