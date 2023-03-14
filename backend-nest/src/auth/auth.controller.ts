import { Body, Controller, Get, Post, Req, Session, UseInterceptors } from '@nestjs/common';
import { SuccessInterceptor } from 'src/interceptor';
import { Request } from 'express';
import { IsBoolean, IsString, Length } from 'class-validator';
import { UnauthorizedException } from '@nestjs/common/exceptions';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { R } from 'src/utility.service';
import { AccountEntity, CreateAccount } from 'src/management/account/account.entity';
import { Session as Express_Session } from 'express-session';
import { User, ILoginInfo } from '../../../interfaces';
import { PickType } from '@nestjs/mapped-types';

export class LoginInfo extends PickType(CreateAccount, ['username', 'password'])
	implements ILoginInfo {
	@IsBoolean()
	public isRememberMe: boolean;
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
		req.session['user'] = user;//todo specify session age base on loginInfo.isRememberMe user selection to be very short. Or do the right thing 🤷‍♂️

		return { ...user };
	}

	@Get('isLogin')
	isLogin(@Session() session: Express_Session) {
		var user: User = session['user'];
		// console.log('AuthController : isLogin : user:', user);

		if (user && user.isLoggedIn)
			return { ...user };

		throw new UnauthorizedException({ message: R.string.mustLogin });
	}

	@Get('logout')
	logout(@Req() req: Request) {
		return new Promise((res, rej) => {
			req.session['user'] = undefined;
			req.session.destroy((e) => {
				if (e) rej(e);
				res({ success:true, message: R.string.loggedOutSuccessfully });
			});
		});
	}
}

