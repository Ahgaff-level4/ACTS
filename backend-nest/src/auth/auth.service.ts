import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { AccountEntity } from 'src/management/account/account.entity';
import { AccountService } from 'src/management/account/account.service';
import { PersonEntity } from 'src/management/person/person.entity';
import { IAccountEntity, User } from '../../../interfaces';

@Injectable()
export class AuthService {
	constructor(@InjectDataSource() private dataSource: DataSource, private accountService: AccountService) { }

	async findAccountsBy(username: string): Promise<AccountEntity[]> {
		return (await this.dataSource.manager.getRepository(AccountEntity)
			.createQueryBuilder('account')
			.leftJoinAndMapOne('account.person', PersonEntity, 'person', 'person.id=account.personId')
			.leftJoinAndSelect('account.rolesEntities', 'roles')
			.where('account.username = :username', { username })
			.getMany())
			.map(this.accountService.extractRoles);
	}

	async findOneById(accountId: number): Promise<IAccountEntity | undefined> {
		return (await this.dataSource.manager.getRepository(AccountEntity)
			.createQueryBuilder('account')
			.leftJoinAndMapOne('account.person', PersonEntity, 'person', 'person.id=account.personId')
			.leftJoinAndSelect('account.rolesEntities', 'roles')
			.where('account.id = :id', { id: accountId })
			.getMany())
			.map(this.accountService.extractRoles)
			.map(this.accountService.deletePassword)[0];
	}

	accountToUser(account: IAccountEntity): User {
		return { person: account.person, isLoggedIn: true, accountId: account.id, roles: account.roles, name: account.person?.name, username: account.username, birthdate: account.person.birthDate, address: account.address, phones: [account.phone0, account.phone1, account.phone2, account.phone3, account.phone4, account.phone5, account.phone6, account.phone7, account.phone8, account.phone9] };
	}

}
