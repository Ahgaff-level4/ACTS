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
import { NotificationGateway } from 'src/websocket/notification.gateway';

export class LoginInfo extends PickType(CreateAccount, ['username', 'password'])
	implements ILoginInfo {
}

@Controller('api/auth')
export class AuthController {
	constructor(private authService: AuthService, private notify: NotificationGateway) { }

	@Post('login')
	async login(@Req() req: Request, @Body() loginInfo: LoginInfo) {
		req.session['user'] = undefined;
		const sel: AccountEntity[] = await this.authService.findAccountsBy(loginInfo.username);
		if (sel.length == 0)
			throw new UnauthorizedException(R.string.invalidUsername);
		const account = sel[0];
		if (!(await bcrypt.compare(loginInfo.password, account.password)))
			throw new UnauthorizedException(R.string.invalidPassword);
		const user: User = { person: account.person, isLoggedIn: true, accountId: account.id, roles: account.roles, name: account.person?.name, username: account.username, birthdate: account.person.birthDate, address: account.address, phones: [account.phone0, account.phone1, account.phone2, account.phone3, account.phone4, account.phone5, account.phone6, account.phone7, account.phone8, account.phone9] };
		req.session['user'] = user;//todo specify session age base on loginInfo.isRememberMe user selection to be very short. Or do the right thing 🤷‍♂️
		return { ...user };
	}

	@Get('isLogin')
	isLogin(@Session() session: Express_Session) {
		const user: User = session['user'];
		// console.log('AuthController : isLogin : user:', user);

		if (user && user.accountId)
			return user;


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

