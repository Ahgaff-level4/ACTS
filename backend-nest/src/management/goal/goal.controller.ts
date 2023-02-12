import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, Query } from '@nestjs/common';
import { GoalService } from './goal.service';
import { ParseBoolPipe, ParseIntPipe } from '@nestjs/common/pipes';
import { CreateGoal, UpdateGoal } from './goal.entity';
import { SuccessInterceptor } from 'src/success.interceptor';
import { Role, Roles } from 'src/auth/Role.guard';

@UseInterceptors(SuccessInterceptor)
@Controller('api/goal')
export class GoalController {
  constructor(private goalService: GoalService) {}

  @Post()
  @Roles(Role.Admin,Role.Teacher)
  create(@Body() createGoal: CreateGoal) {
    return this.goalService.create(createGoal);
  }

  @Get()
  findAll(@Query('FK',ParseBoolPipe) fk:boolean) {
    return this.goalService.findAll(fk);
  }

  @Get(':id')
  findOne(@Param('id',ParseIntPipe) id: number) {
    return this.goalService.findOne(+id);
  }

  @Patch(':id')
  @Roles(Role.Admin,Role.HeadOfDepartment,Role.Teacher)
  update(@Param('id',ParseIntPipe) id: number, @Body() updateGoal: UpdateGoal) {
    return this.goalService.update(+id, updateGoal);
  }

  @Delete(':id')
  @Roles(Role.Admin,Role.HeadOfDepartment,Role.Teacher)
  remove(@Param('id',ParseIntPipe) id: number) {
    return this.goalService.remove(+id);
  }
}
