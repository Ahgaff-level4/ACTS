import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, ParseIntPipe, Query, ParseBoolPipe, Req, Session } from '@nestjs/common';
import { ChildService } from './child.service';
import { SuccessInterceptor } from 'src/success.interceptor';
import { CreateChild, UpdateChild } from './child.entity';
import { Request } from 'express';
import { Role, Roles } from 'src/auth/Role.guard';
import { UnauthorizedException } from '@nestjs/common/exceptions/unauthorized.exception';
import { User } from 'src/utility.service';
import { Session as ExpressSession } from 'express-session';

@UseInterceptors(SuccessInterceptor)
@Controller('api/child')
export class ChildController {
  constructor(private readonly childService: ChildService) { }

  @Post()
  @Roles(Role.Admin,Role.HeadOfDepartment)
  create(@Body() createChild: CreateChild) {
    return this.childService.create(createChild);
  }

  @Get()
  @Roles(Role.Admin,Role.HeadOfDepartment,Role.Teacher)
  findAll(@Query('FK', ParseBoolPipe) fk: boolean) {
    return this.childService.findAll(fk);
  }
  
  @Get('/parent')
  @Roles(Role.Parent)
  findChildrenOfParent(@Session() session:ExpressSession){
    if(session && session['user'] && session['user'].parentId){
      const user:User = session['user'];
      return this.childService.findChildrenOfParent(user.parentId)
    }
    throw new UnauthorizedException('')
  }

  @Get(':id')
  @Roles(Role.Admin,Role.HeadOfDepartment,Role.Teacher)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.childService.findOne(+id);
  }

  @Patch(':id')
  @Roles(Role.Admin,Role.HeadOfDepartment)
  update(@Param('id', ParseIntPipe) id: number, @Body() updateChild: UpdateChild) {
    return this.childService.update(+id, updateChild);
  }

  @Delete(':id')
  @Roles(Role.Admin,Role.HeadOfDepartment)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.childService.remove(+id);
  }
}
