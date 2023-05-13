import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Put } from '@nestjs/common';
import { AccountService } from './account.service';
import { ChangePassword, CreateAccount, UpdateAccount } from './account.entity';
import { Roles } from 'src/auth/Role.guard';


@Controller('api/account')
export class AccountController {
    constructor(private readonly accountService: AccountService) { }

    @Post()
    @Roles('Admin')
    create(@Body() createAccount: CreateAccount) {
        return this.accountService.create(createAccount);
    }

    @Get()
    @Roles('Admin')
    findAll() {
        return this.accountService.findAll();
    }

    @Get(':id')
    @Roles('Admin','HeadOfDepartment','Teacher','Parent')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.accountService.findOne(+id);
    }

    @Patch(':id')
    @Roles('Admin','HeadOfDepartment','Teacher','Parent')
    updateOldPassword(@Param('id', ParseIntPipe) id: number, @Body() changePassword: ChangePassword) {
        return this.accountService.updateOldPassword(+id, changePassword);
    }

    @Put(':id')
    @Roles('Admin')
    update(@Param('id', ParseIntPipe) id: number, @Body() updateAccount: UpdateAccount) {
        return this.accountService.update(id, updateAccount);
    }

    @Delete(':id')
    @Roles('Admin')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.accountService.remove(+id);
    }
}
