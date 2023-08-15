import { Body, Controller, Get, Post, Req, Session } from '@nestjs/common';
import { Request } from 'express';
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
}

@Controller('api/auth')
export class AuthController {
	constructor(private authService: AuthService) { }

	@Post('login')
	async login(@Req() req: Request, @Body() loginInfo: LoginInfo) {
		req.session['user'] = undefined;
		const sel: AccountEntity[] = await this.authService.findAccountsBy(loginInfo.username);
		if (sel.length == 0)
			throw new UnauthorizedException(R.string.invalidUsername);
		const account = sel[0];
		if (!(await bcrypt.compare(loginInfo.password, account.password)))
			throw new UnauthorizedException(R.string.invalidPassword);
		const user: User = this.authService.accountToUser(account);
		req.session['user'] = user;
		return user;
	}

	@Get('isLogin')
	async isLogin(@Session() session: Express_Session) {
		const user: User = session['user'];

		//if user update his account we need to re-assign user info from DB
		if (user && user.accountId) {
			const account = await this.authService.findOneById(user.accountId);
			if (!account)
				throw new UnauthorizedException();
			const newUser = this.authService.accountToUser(account);
			session['user'] = newUser;
			return newUser;
		}

		throw new UnauthorizedException({ message: R.string.mustLogin, action: 'login' });
	}

	@Get('logout')
	logout(@Req() req: Request) {
		return new Promise((res, rej) => {
			if (typeof req.session['user']?.accountId == 'number')
				delete req.session['user'];
			req.session.destroy((e) => {
				if (e) rej(e);
				res({ success: true, message: R.string.loggedOutSuccessfully });
			});
		});
	}
}

