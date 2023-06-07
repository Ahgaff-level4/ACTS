import { Body, Controller, Delete, Get, Inject, Param, ParseIntPipe, Patch, Post, Put } from '@nestjs/common';
import { AccountService } from './account.service';
import { ChangePassword, CreateAccount, UpdateAccount } from './account.entity';
import { Roles } from 'src/auth/Role.guard';
import { NotificationGateway } from 'src/websocket/notification.gateway';
import { UserMust } from 'src/utility.service';
import { User } from '../../../../interfaces';


@Controller('api/account')
export class AccountController {
    constructor(private readonly accountService: AccountService, private notify: NotificationGateway) { }

    @Post()
    @Roles('Admin')
    async create(@Body() createAccount: CreateAccount, @UserMust() user: User) {
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
    @Roles('Admin')
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
    @Roles('Admin')
    async update(@Param('id', ParseIntPipe) id: string, @Body() updateAccount: UpdateAccount, @UserMust() user: User) {
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
