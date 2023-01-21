import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt'
@Injectable()
export class AccountService {

    /**
     * @param password plain password
     * @returns hash & salt concatenated used to store in the DB
     */
    async generateHashSalt(password: string): Promise<string> {
        const salt = await bcrypt.genSalt()
        return bcrypt.hash(password, salt);
    }

}
