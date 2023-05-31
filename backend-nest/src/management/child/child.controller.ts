import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UnauthorizedException } from '@nestjs/common';
import { ChildService } from './child.service';
import { CreateChild, UpdateChild } from './child.entity';
import { Roles } from 'src/auth/Role.guard';
import { R, UserMust } from 'src/utility.service';
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
  @Roles('Admin', 'HeadOfDepartment', 'Teacher','Parent')
  /** findAll will check user privilege then will return the children base on:
  * - if Admin or HeadOfDepartment then return all children.
  * - if Teacher then return all children that taught by that teacher.
  * - if Parent then return all parent's children.*/
  findAll(@UserMust() user: User) {
    if (user.roles.includes('Admin') || user.roles.includes('HeadOfDepartment'))
      return this.childService.findAll();
    else if(user.roles.includes('Parent'))
    return this.childService.findAllParentChildren(user.accountId);
    else if(user.roles.includes('Teacher'))
    return this.childService.findAllTeacherChildren(user.accountId);
    else throw new UnauthorizedException(R.string.insufficientPrivilege);
  }

  // @Get('/parent')
  // @Roles('Parent','Admin','HeadOfDepartment','Teacher')
  // findChildrenOfParent(@Session() session: ExpressSession) {
  //   const user: User = session && session['user'];
  //   if (session['user'] && (session['user'] as User).roles.includes('Parent')) {
  //     return this.childService.findChildrenOfParent(user.accountId)
  //   }
  //   throw new UnauthorizedException(R.string.onlyParent)
  // }

  @Get(':id/goals')
  @Roles('Admin', 'HeadOfDepartment', 'Teacher', 'Parent')
  findOneItsGoals(@Param('id', ParseIntPipe) id: number) {
    return this.childService.findOneItsGoals(+id);
  }

  @Get(':id/strengths')
  @Roles('Admin', 'HeadOfDepartment', 'Teacher', 'Parent')
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
