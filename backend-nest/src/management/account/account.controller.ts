import { Body, Controller, Delete, Get, Param, ParseBoolPipe, ParseIntPipe, Patch, Post, Put, Query, UseInterceptors } from '@nestjs/common';
import { AccountService } from './account.service';
import { SuccessInterceptor } from 'src/SuccessInterceptor';
import { CreateAccount, UpdateAccount, UpdateAccountOldPassword } from './account.entity';


@UseInterceptors(SuccessInterceptor)
@Controller('api/account')
export class AccountController {
    constructor(private readonly accountService: AccountService) { }

    @Post()
    create(@Body() createAccount: CreateAccount) {
        return this.accountService.create(createAccount);
    }

    @Get()
    findAll(@Query('FK',ParseBoolPipe) fk:boolean) {
        return this.accountService.findAll(fk);
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.accountService.findOne(+id);
    }

    @Patch(':id')
    updateOldPassword(@Param('id', ParseIntPipe) id: number, @Body() updateAccount: UpdateAccountOldPassword) {
        return this.accountService.updateOldPassword(+id, updateAccount);
    }
    
    @Put(':id')
    update(@Param('id',ParseIntPipe) id:number, @Body() updateAccount:UpdateAccount){
        return this.accountService.update(id,updateAccount);
    }

    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.accountService.remove(+id);
    }
}