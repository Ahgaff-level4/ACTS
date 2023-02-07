import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseInterceptors } from '@nestjs/common';
import { AccountService } from './account.service';
import { SuccessInterceptor } from 'src/SuccessInterceptor';
import { CreateAccount, UpdateAccount } from './account.entity';
export class LoginInfo {
    username: string;
    password: string;
}

@UseInterceptors(SuccessInterceptor)
@Controller('api/account')
export class AccountController {
    constructor(private readonly accountService: AccountService) { }

    @Post()
    create(@Body() createAccount: CreateAccount) {
        return this.accountService.create(createAccount);
    }

    @Get()
    findAll() {
        return this.accountService.findAll();
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.accountService.findOne(+id);
    }

    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: number, @Body() updateAccount: UpdateAccount) {
        return this.accountService.update(+id, updateAccount);
    }

    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.accountService.remove(+id);
    }

}
