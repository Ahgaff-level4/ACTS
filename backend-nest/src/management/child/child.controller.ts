import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UnauthorizedException } from '@nestjs/common';
import { ChildService } from './child.service';
import { CreateChild, UpdateChild } from './child.entity';
import { Roles } from 'src/auth/Role.guard';
import { R, UserMust } from 'src/utility.service';
import { User } from '../../../../interfaces';
import { NotificationGateway } from 'src/websocket/notification.gateway';

@Controller('api/child')
export class ChildController {
  constructor(private readonly childService: ChildService, private notify: NotificationGateway) { }

  @Post()
  @Roles('Admin', 'HeadOfDepartment')
  async create(@Body() createChild: CreateChild, @UserMust() user: User) {
    const ret = await this.childService.create(createChild);
    this.notify.emitNewNotification({
      by: user,
      controller: 'child',
      datetime: new Date(),
      method: 'POST',
      payloadId: ret.id,
      payload: ret,
    });
    return ret;
  }

  @Get()
  @Roles('Admin', 'HeadOfDepartment', 'Teacher', 'Parent')
  /** findAll will check user privilege then will return the children base on:
  * - if Admin or HeadOfDepartment then return all children.
  * - if Teacher then return all children that taught by that teacher.
  * - if Parent then return all parent's children.*/
  findAll(@UserMust() user: User) {
    if (user.roles.includes('Admin') || user.roles.includes('HeadOfDepartment'))
      return this.childService.findAll();
    else if (user.roles.includes('Parent'))
      return this.childService.findAllParentChildren(user.accountId);
    else if (user.roles.includes('Teacher'))
      return this.childService.findAllTeacherChildren(user.accountId);
    else throw new UnauthorizedException(R.string.insufficientPrivilege);
  }

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
  async update(@Param('id', ParseIntPipe) id: number, @Body() updateChild: UpdateChild, @UserMust() user: User) {

    const ret = await this.childService.update(+id, updateChild);
    this.notify.emitNewNotification({
      by: user,
      controller: 'child',
      datetime: new Date(),
      method: 'PATCH',
      payloadId: +id,
      payload: updateChild,
    });
    return ret;
  }

  @Delete(':id')
  @Roles('Admin', 'HeadOfDepartment')
  async remove(@Param('id', ParseIntPipe) id: number, @UserMust() user: User) {
    const ret = await this.childService.remove(+id);
    this.notify.emitNewNotification({
      by: user,
      controller: 'child',
      datetime: new Date(),
      method: 'DELETE',
      payloadId: +id,
      payload:ret,
    });
    return ret;
  }
}
