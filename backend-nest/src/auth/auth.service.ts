import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database.service';
import { Role } from './Role';

@Injectable()
export class AuthService {
    constructor(private db: DatabaseService) { }
		
		/**
		 * 
		 * @param accountId is the id of an Account table record
		 * @returns array of roles that account is part of. (e.g., [Role.Teacher, Role.Parent])
		 */
		async getAccountRoles(accountId:number):Promise<Role[]>{
			var roles:Role[] = [];
		const parent = await this.db.select('id','parent','accountId=?',[accountId]);
		if(parent.length!=0)
			roles.push(Role.Parent);
		//todo
			return roles;
		}
}
