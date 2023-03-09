import { Body, Controller, Get, Post, Req, Session, UseInterceptors } from '@nestjs/common';
import { SuccessInterceptor } from 'src/interceptor';
import { Request } from 'express';
import { IsString } from 'class-validator';
import { UnauthorizedException } from '@nestjs/common/exceptions';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { R } from 'src/utility.service';
import { InjectRepository } from '@nestjs/typeorm';
import { AccountEntity } from 'src/management/account/account.entity';
import { Repository } from 'typeorm';
import {Session as Express_Session} from 'express-session';
import { User } from '../../../interfaces';

export class LoginInfo {
	@IsString()
	username: string;
	@IsString()
	password: string;
}

@Controller('api/auth')
export class AuthController {
	constructor(private authService: AuthService) { }

	@Post('login')
	async login(@Req() req: Request, @Body() loginInfo: LoginInfo) {
		req.session['user'] = undefined;
		const sel: AccountEntity[] = await this.authService.findAccountsBy(loginInfo.username);
		if (sel.length == 0)
			throw new UnauthorizedException(R.string.invalidUsernameOrPassword);
		const account = sel[0];
		if (!(await bcrypt.compare(loginInfo.password, account.password)))
			throw new UnauthorizedException(R.string.invalidUsernameOrPassword);
		var user: User = { isLoggedIn: true, accountId: account.id, roles: account.roles, name: account.person?.name };
		req.session['user'] = user;
		user = { ...user };
		delete user.isLoggedIn;
		return { message: R.string.loggedInSuccessfully, ...user };
	}

	@Get('isLogin')
	isLogin(@Session() session: Express_Session) {
		var user: User = session['user'];
		if (user && user.isLoggedIn) {
			user = { ...user };
			delete user.isLoggedIn;
			return user;
		}
		throw new UnauthorizedException({ message: R.string.mustLogin });
	}

	@Get('logout')
	logout(@Req() req: Request) {
		return new Promise((res, rej) => {
			req.session['user'] = undefined;
			req.session.destroy((e) => {
				if (e) rej(e);
				res({ message: R.string.loggedOutSuccessfully });
			});
		})
	}
}

