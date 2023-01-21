import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt'
@Injectable()
export class LoginService {

    /**
     * @param plainPassword Plain password of a user try to login
     * @param userHashSalt Hash & Salt of a username that try to login. Hash & Salt is what stored in the DB
     * @returns True if the user entered valid password. False if invalid password or username
     */
    validPassword(plainPassword: string, userHashSalt: string): Promise<boolean> {
        return bcrypt.compare(plainPassword, userHashSalt);
    }
    
    generateToken
}
