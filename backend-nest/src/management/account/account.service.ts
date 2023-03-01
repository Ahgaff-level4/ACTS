import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt'
import { AccountEntity, AccountView, CreateAccount, UpdateAccount } from './account.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PersonView } from '../person/person.entity';
@Injectable()
export class AccountService {
    constructor(@InjectRepository(AccountEntity) private repo: Repository<AccountEntity>,
        @InjectRepository(AccountView) private view:Repository<AccountView>) { }

    async create(createAccount: CreateAccount) {
        createAccount.password = await this.generateHashSalt(createAccount.password);
        return this.repo.save(this.repo.create(createAccount));
    }

    findAll() {
        return this.view
            .createQueryBuilder('account')
            .leftJoinAndMapOne('account.person', PersonView, 'person', 'account.personId=person.id')
            .getMany()
    }

    findOne(id: number) {
        return this.repo
            .createQueryBuilder('account')
            .leftJoinAndMapOne('account.person', PersonView, 'person', 'account.personId=person.id')
            .where('account.id=:id', { id })
            .getMany()
    }

    /**
     * UpdateAccount needs oldPassword. And it will validate the old password with existed password, if invalid throw Unauthorized exception
     */
    // async updateOldPassword(id: number, updateAccount: UpdateAccountOldPassword) {
    // if (updateAccount.password)
    //     updateAccount.password = await this.generateHashSalt(updateAccount.password);

    // var oldPassword = await this.db.select('password', 'account', 'id=?', [id]) as [{ password: string }] | [];
    // if (oldPassword.length == 0)
    //     throw new BadRequestException('Account with id provided dose not exist!')

    // let oldPass: string = oldPassword[0].password;
    // if (!(await bcrypt.compare(updateAccount.oldPassword, oldPass)))
    //     throw new UnauthorizedException('Old password is invalid!');

    // delete updateAccount.oldPassword;
    // return this.db.update('account', id, updateAccount);
    // }

    /**
     * Same as update(...) BUT no need for oldPassword. Must be authorized only by admin
     */
    async update(id: number, updateAccount: UpdateAccount) {
        if (updateAccount.password)
            updateAccount.password = await this.generateHashSalt(updateAccount.password);
        return this.repo.update(id, updateAccount);
    }

    remove(id: number) {
        return this.repo.delete(id);
    }


    /**
     * @param password plain password
     * @returns hash & salt concatenated used to store in the DB
     */
    private async generateHashSalt(password: string): Promise<string> {
        const salt = await bcrypt.genSalt();
        return await bcrypt.hash(password, salt);
    }
}
