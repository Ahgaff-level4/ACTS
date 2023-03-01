import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database.service';
import {Role} from './../../../interfaces.d';

@Injectable()
export class AuthService {
	constructor(private db: DatabaseService) { }

	/**
	 * 
	 * @param accountId is the id of an Account table record
	 * @returns array of roles that account is part of. (e.g., [Role.Teacher, Role.Parent])
	 */
	async getAccountRoles(accountId: number){//: Promise<{ roles: Role[], parentId?: number, teacherId?: number, hdId?: number }> {
		// var roles: Role[] = [];

		// const parent = await this.db.select('id', 'parent', 'accountId=?', [accountId]);
		// if (parent.length > 0)
		// 	roles.push('Parent');
		// const teacher = await this.db.select('id', 'teacher', 'accountId=?', [accountId])
		// if (teacher.length > 0)
		// 	roles.push('Teacher');
		// const hd = await this.db.select('id', 'hd', 'accountId=?', [accountId]);
		// if (hd.length > 0)
		// 	roles.push('HeadOfDepartment');

		// if (roles.includes('Teacher') && roles.includes('HeadOfDepartment')) {
		// 	roles.splice(roles.indexOf('Teacher'), 1)
		// 	roles.splice(roles.indexOf('HeadOfDepartment'), 1)
		// 	roles.push('Admin')
		// }
		// return { roles, parentId: parent[0]?.id, teacherId: teacher[0]?.id, hdId: hd[0]?.id }
	}
}
