import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt'
import { CreateAccount, UpdateAccount } from './account.entity';
import { DatabaseService } from 'src/database.service';
@Injectable()
export class AccountService {
    constructor(private db:DatabaseService){}
    
    async create(createAccount: CreateAccount) {
        createAccount.password = await this.generateHashSalt(createAccount.password);
        this.db.create('account',createAccount);
    }
    
    findAll() {
        this.db.select('*','account')
    }
    
    findOne(id: number) {
        this.db.select('*','account','id=?',[id]);
    }
    
    update(id: number, updateAccount: UpdateAccount) {
        this.db.update('account',id,updateAccount);
    }
    remove(id: number) {
        this.db.delete('account',id);
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
