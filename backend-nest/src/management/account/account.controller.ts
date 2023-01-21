import { Body, Controller,Get,Post } from '@nestjs/common';
import { AccountService } from './account.service';
export class LoginInfo {
    username:string;
    password:string;
}


@Controller('api/account')
export class AccountController {
    constructor(private readonly service:AccountService){}
    @Post()
    async createAccount(@Body() loginInfo:LoginInfo){
        const hash = await this.service.generateHashSalt(loginInfo.password);
        return {
            success:true,
            data: {hash}
        }
    }
    
    
}
