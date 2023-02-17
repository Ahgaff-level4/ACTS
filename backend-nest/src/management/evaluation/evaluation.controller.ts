import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, Query } from '@nestjs/common';
import { EvaluationService } from './evaluation.service';
import { ParseBoolPipe, ParseIntPipe } from '@nestjs/common/pipes';
import { CreateEvaluation, EvaluationEntity, UpdateEvaluation } from './evaluation.entity';
import { Roles } from 'src/auth/Role.guard';
import { BadRequestException } from '@nestjs/common/exceptions/bad-request.exception';
import { Session } from '@nestjs/common/decorators';
import { R, User, UserMust, UserSession } from 'src/utility.service';
import { UnauthorizedException } from '@nestjs/common/exceptions/unauthorized.exception';

@Controller('api/evaluation')
export class EvaluationController {
  constructor(private evaluationService: EvaluationService) { }

  @Post()
  @Roles('Admin', 'Teacher')
  create(@Body() createEvaluation: CreateEvaluation, @Session() session) {
    if (createEvaluation.teacherId)
      return this.evaluationService.create(createEvaluation);
    if (session && session['user']) {
      const user: User = session['user'];
      if (user.teacherId)
        createEvaluation.teacherId = user.teacherId;
      else throw new UnauthorizedException(R.string.onlyAdminTeacher);
      return this.evaluationService.create(createEvaluation);
    }
  }

  @Get()
  findAll(@Query('FK', ParseBoolPipe) fk: boolean, @Query('goalId') goalIdStr: string, @Session() session) {
    const goalId: number = Number(goalIdStr);
    if (goalId) {
      if (!Number.isInteger(goalId) || goalId <= 0)
        throw new BadRequestException();
      return this.evaluationService.findAllOfGoal(fk, goalId);//! anyone loggedin can access any goal
    }
    if (session && session['user'] && (session['user'] as User).roles.includes('Admin'))
      return this.evaluationService.findAll(fk);
    throw new UnauthorizedException(R.string.insufficientPrivilege);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.evaluationService.findOne(+id);
  }

  @Patch(':id')
  @Roles('Admin', 'Teacher', 'HeadOfDepartment')
  async update(@Param('id', ParseIntPipe) id: number, @Body() updateEvaluation: UpdateEvaluation, @UserMust() user: User) {
    if (user.roles.length == 2 || user.roles.includes('HeadOfDepartment'))//only admin and hd can update any evaluation
      return this.evaluationService.update(+id, updateEvaluation);
    const evaluation = await this.evaluationService.findOne(id);

    if (user.roles.includes('Teacher') && evaluation && evaluation[0] && evaluation[0].teacherId == user.teacherId)//teacher can only update his/her evaluation
      return this.evaluationService.update(+id, updateEvaluation);
    throw new UnauthorizedException(R.string.insufficientPrivilege);
  }

  @Delete(':id')
  @Roles('Admin', 'Teacher', 'HeadOfDepartment')
  async remove(@Param('id', ParseIntPipe) id: number, @UserMust() user: User) {
    if (user.roles.length == 2 || user.roles.includes('HeadOfDepartment'))//only admin and hd can update any evaluation
      return this.evaluationService.remove(+id);
    const evaluation = await this.evaluationService.findOne(id);

    if (user.roles.includes('Teacher') && evaluation && evaluation[0] && (evaluation[0] as EvaluationEntity).teacherId == user.teacherId)//teacher can only update his/her evaluation
      return this.evaluationService.remove(+id);
    throw new UnauthorizedException(R.string.insufficientPrivilege);
  }
}
