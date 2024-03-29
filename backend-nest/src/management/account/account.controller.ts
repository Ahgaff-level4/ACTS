import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Put, UnauthorizedException } from '@nestjs/common';
import { AccountService } from './account.service';
import { ChangePassword, CreateAccount, UpdateAccount } from './account.entity';
import { Roles } from 'src/auth/Role.guard';
import { NotificationGateway } from 'src/notification/notification.gateway';
import { UserMust } from 'src/utility.service';
import { User } from '../../../../interfaces';


@Controller('api/account')
export class AccountController {
    constructor(private readonly accountService: AccountService, private notify: NotificationGateway) { }

    @Post()
    @Roles('Admin', 'HeadOfDepartment')//HeadOfDepartment can only create Parent account
    async create(@Body() createAccount: CreateAccount, @UserMust() user: User) {
        if (!user.roles.includes('Admin') && (createAccount.roles.length != 1 || !createAccount.roles.includes('Parent')))
            throw new UnauthorizedException('HeadOfDepartment can only create parent account. createAccount.roles=' + createAccount.roles + '. User roles=' + user.roles);
        const ret = await this.accountService.create(createAccount);
        this.notify.emitNewNotification({
            by: user,
            controller: 'account',
            datetime: new Date(),
            method: 'POST',
            payloadId: ret.id,
            payload: ret,
        });
        return ret;
    }

    @Get()
    @Roles('Admin', 'HeadOfDepartment')//select parent of a child needs this function
    findAll() {
        return this.accountService.findAll();
    }

    @Get(':id')
    @Roles('Admin', 'HeadOfDepartment', 'Teacher', 'Parent')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.accountService.findOne(+id);
    }

    @Patch(':id')
    @Roles('Admin', 'HeadOfDepartment', 'Teacher', 'Parent')
    async updateOldPassword(@Param('id', ParseIntPipe) id: string, @Body() changePassword: ChangePassword, @UserMust() user: User) {
        const ret = await this.accountService.updateOldPassword(+id, changePassword);
        this.notify.emitNewNotification({
            by: user,
            controller: 'account',
            datetime: new Date(),
            method: 'PATCH',
            payloadId: +id,
            payload: ret,
        });
        return ret;
    }

    @Put(':id')
    @Roles('Admin', 'HeadOfDepartment', 'Teacher', 'Parent')
    async update(@Param('id', ParseIntPipe) id: string, @Body() updateAccount: UpdateAccount, @UserMust() user: User) {
        //Admin can update all accounts info AND user can update some of his/her information
        if (!user.roles.includes('Admin') && (+id != user.accountId || !Object.keys(updateAccount).every((v: keyof UpdateAccount) => v == 'address' || v == 'phone0' || v == 'phone1' || v == 'phone2' || v == 'phone3' || v == 'phone4' || v == 'phone5' || v == 'phone6' || v == 'phone7' || v == 'phone8' || v == 'phone9' || v == 'username')))
            throw new UnauthorizedException();
        const ret = await this.accountService.update(+id, updateAccount);
        this.notify.emitNewNotification({
            by: user,
            controller: 'account',
            datetime: new Date(),
            method: 'PUT',
            payloadId: +id,
            payload: ret,
        });
        return ret;
    }

    @Delete(':id')
    @Roles('Admin')
    async remove(@Param('id', ParseIntPipe) id: string, @UserMust() user: User) {
        const ret = await this.accountService.remove(+id);
        this.notify.emitNewNotification({
            by: user,
            controller: 'account',
            datetime: new Date(),
            method: 'DELETE',
            payloadId: +id,
            payload: ret,
        });
        return ret;
    }
}
