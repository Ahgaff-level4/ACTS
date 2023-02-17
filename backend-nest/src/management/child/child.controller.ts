import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, ParseIntPipe, Query, ParseBoolPipe, Req, Session } from '@nestjs/common';
import { ChildService } from './child.service';
import { CreateChild, UpdateChild } from './child.entity';
import { Roles } from 'src/auth/Role.guard';
import { UnauthorizedException } from '@nestjs/common/exceptions/unauthorized.exception';
import { User } from 'src/utility.service';
import { Session as ExpressSession } from 'express-session';

@Controller('api/child')
export class ChildController {
  constructor(private readonly childService: ChildService) { }

  @Post()
  @Roles('Admin', 'HeadOfDepartment')
  create(@Body() createChild: CreateChild) {
    return this.childService.create(createChild);
  }

  @Get()
  @Roles('Admin', 'HeadOfDepartment', 'Teacher')
  findAll(@Query('FK', ParseBoolPipe) fk: boolean) {
    return this.childService.findAll(fk);
  }

  @Get('/parent')
  @Roles('Parent')
  findChildrenOfParent(@Session() session: ExpressSession) {
    if (session && session['user'] && session['user'].parentId) {
      const user: User = session['user'];
      return this.childService.findChildrenOfParent(user.parentId)
    }
    throw new UnauthorizedException('')
  }

  @Get(':id')
  @Roles('Admin', 'HeadOfDepartment', 'Teacher')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.childService.findOne(+id);
  }

  @Patch(':id')
  @Roles('Admin', 'HeadOfDepartment')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateChild: UpdateChild) {
    return this.childService.update(+id, updateChild);
  }

  @Delete(':id')
  @Roles('Admin', 'HeadOfDepartment')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.childService.remove(+id);
  }
}
