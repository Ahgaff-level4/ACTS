import { Body, Controller, Get, Post, Req, UseInterceptors } from '@nestjs/common';
import { SuccessInterceptor } from 'src/interceptor';
import { Request } from 'express';
import { IsString } from 'class-validator';
import { UnauthorizedException } from '@nestjs/common/exceptions';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { R, User } from 'src/utility.service';
import { InjectRepository } from '@nestjs/typeorm';
import { AccountEntity } from 'src/management/account/account.entity';
import { Repository } from 'typeorm';

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
		console.log('AuthController : login : sel:', sel);
		if (sel.length == 0)
			throw new UnauthorizedException(R.string.invalidUsernameOrPassword);
		const account = sel[0];
		if (!(await bcrypt.compare(loginInfo.password, account.password)))
			throw new UnauthorizedException(R.string.invalidUsernameOrPassword);
		var user: User = { isLoggedIn: true, accountId: account.id, roles: account.roles };
		req.session['user'] = user;
		return { message: R.string.loggedInSuccessfully, roles:account.roles,accountId:account.id,name:account.person?.name };
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

