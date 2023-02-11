import { Body, Controller, Get, Post, Req, UseInterceptors } from '@nestjs/common';
import { SuccessInterceptor } from 'src/success.interceptor';
import { Request } from 'express';
import { DatabaseService } from 'src/database.service';
import { IsString } from 'class-validator';
import { UnauthorizedException } from '@nestjs/common/exceptions';
import * as bcrypt from 'bcrypt';
import { Role } from './Role';

export class User{
	@IsString()
	username:string;
	@IsString()
	password:string;
}

@UseInterceptors(SuccessInterceptor)
@Controller('api/auth')
export class AuthController {
	constructor(private db:DatabaseService) { }

	@Post('login')
	async login(@Req() req: Request,@Body() user:User) {
		const sel:{id:number,password:string}[] = (await this.db.select('id,password','account','BINARY username=?',[user.username])) as {id:number,password:string}[];
		if(sel.length == 0)
			throw new UnauthorizedException('Invalid username or password!');
		const account = sel[0];
		if (!(await bcrypt.compare(user.password, account.password)))
            throw new UnauthorizedException('Invalid password or username!');
		req.session['loggedIn'] = true;
		req.session['accountId'] = account.id;
		// req.session['roles'] = await 
		
		
		
		return {message:'Logged in successfully'};
	}
}

