import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, ParseIntPipe, Query, ParseBoolPipe, Req, Session, ParseEnumPipe } from '@nestjs/common';
import { ChildService } from './child.service';
import { CreateChild, UpdateChild } from './child.entity';
import { Roles } from 'src/auth/Role.guard';
import { UnauthorizedException } from '@nestjs/common/exceptions/unauthorized.exception';
import { R } from 'src/utility.service';
import { Session as ExpressSession } from 'express-session';
import { User } from '../../../../interfaces';

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
    const user: User = session && session['user'];
    if (session['user'] && (session['user'] as User).roles.includes('Parent')) {
      return this.childService.findChildrenOfParent(user.accountId)
    }
    throw new UnauthorizedException(R.string.onlyParent)
  }

  @Get(':id/goals')
  @Roles('Admin', 'HeadOfDepartment', 'Teacher')
  findOneItsGoals(@Param('id', ParseIntPipe) id: number) {
    return this.childService.findOneItsGoals(+id);
  }

  @Get(':id/strengths')
  @Roles('Admin', 'HeadOfDepartment', 'Teacher')
  findOneItsStrengths(@Param('id', ParseIntPipe) id: number) {
    return this.childService.findOneItsStrengths(+id);
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
