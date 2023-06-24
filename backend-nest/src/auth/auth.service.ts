import { Injectable } from '@nestjs/common';
import { Role } from './../../../interfaces.d';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { AccountEntity } from 'src/management/account/account.entity';
import { AccountService } from 'src/management/account/account.service';
import { PersonView } from 'src/management/person/person.entity';

@Injectable()
export class AuthService {
	constructor(@InjectDataSource() private dataSource: DataSource, private accountService: AccountService) { }

	async findAccountsBy(username: string): Promise<AccountEntity[]> {
		return (await this.dataSource.manager.getRepository(AccountEntity)
			.createQueryBuilder('account')
			.leftJoinAndMapOne('account.person', PersonView, 'person', 'person.id=account.personId')
			.leftJoinAndSelect('account.rolesEntities', 'roles')
			.where('account.username = :username', { username })
			.getMany())
			.map(this.accountService.extractRoles);
	}

}
