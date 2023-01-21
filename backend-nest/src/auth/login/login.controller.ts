import { Body, Controller, Get, Post } from '@nestjs/common';
import { LoginService } from './login.service';
import * as bcrypt from 'bcrypt'
@Controller('api/login')
export class LoginController {
    constructor(private readonly service: LoginService) { }
    // @Get()
    // async login(@Body() loginInfo:LoginInfoDto) {
    //     return {
    //         username:loginInfo.username,
    //         password:loginInfo.password,
            
    //     }
    // }
}

