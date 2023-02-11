import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database.service';
import { Role } from './Role.guard';
import { Session, SessionData } from 'express-session';

@Injectable()
export class AuthService {
	constructor(private db: DatabaseService) { }

	/**
	 * 
	 * @param session req.session
	 * set: loggedIn=false,accountId=undefined,roles=[]
	 */
	clearSession(session: Session & Partial<SessionData>): void {
		session['loggedIn'] = false;
		session['accountId'] = undefined;
		session['roles'] = [];//reset session
	}

	/**
	 * 
	 * @param accountId is the id of an Account table record
	 * @returns array of roles that account is part of. (e.g., [Role.Teacher, Role.Parent])
	 */
	async getAccountRoles(accountId: number): Promise<Role[]> {
		var roles: Role[] = [];

		const parent = await this.db.select('id', 'parent', 'accountId=?', [accountId]);
		if (parent.length > 0)
			roles.push(Role.Parent);
		const teacher = await this.db.select('id', 'teacher', 'accountId=?', [accountId])
		if (teacher.length > 0)
			roles.push(Role.Teacher);
		const hd = await this.db.select('id', 'hd', 'accountId=?', [accountId]);
		if (hd.length > 0)
			roles.push(Role.HeadOfDepartment);

		if (roles.includes(Role.Teacher) && roles.includes(Role.HeadOfDepartment)) {
			roles.splice(roles.indexOf(Role.Teacher), 1)
			roles.splice(roles.indexOf(Role.HeadOfDepartment), 1)
			roles.push(Role.Admin)
		}
		return roles;
	}
}
