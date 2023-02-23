import { BadRequestException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt'
import { AccountEntity, CreateAccount, UpdateAccount, UpdateAccountOldPassword } from './account.entity';
import { DatabaseService, DbResult } from 'src/database.service';
import { RowDataPacket } from 'mysql2';
import { HttpExceptionFilter } from 'src/MyException.filter';
import { HttpCode } from '@nestjs/common/decorators/http/http-code.decorator';
import { STATUS_CODES } from 'http';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { PersonEntity } from '../person/person.entity';
@Injectable()
export class AccountService {
    constructor(private db:DatabaseService) { }

    async create(createAccount: CreateAccount) {
        createAccount.password = await this.generateHashSalt(createAccount.password);
        return this.db.create(AccountEntity, createAccount);
    }

    findAll(fk: boolean) {
        if (fk)
            return this.db.manager.find(AccountEntity,{ relations: { person: true }, select: { password: false } });
        else return this.db.manager.find(AccountEntity,{ select: { password: false } });
    }

    findOne(id: number) {
        return this.db.manager.findOneBy(AccountEntity,{id})
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
     * Same as update(...) BUT no need for oldPassword. Must authorized only by admin
     */
    async update(id: number, updateAccount: UpdateAccount) {
        // if (updateAccount.password)
        //     updateAccount.password = await this.generateHashSalt(updateAccount.password);
        // const runner = this.dataSource.createQueryRunner();
        // await runner.connect();
        // await runner.startTransaction();
        // const result = [
        // await runner.manager.update(PersonEntity,updateAccount.person.id,updateAccount.person),
        // await runner.manager.update(AccountEntity,id,updateAccount)];
        // runner.commitTransaction();
        // return result;
    }

    remove(id: number) {
        // return this.db.delete('account', id);
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
