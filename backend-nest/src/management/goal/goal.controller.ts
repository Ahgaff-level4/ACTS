import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { GoalService } from './goal.service';
import { ParseBoolPipe, ParseIntPipe } from '@nestjs/common/pipes';
import { CreateGoal, UpdateGoal } from './goal.entity';
import { Roles } from 'src/auth/Role.guard';

@Controller('api/goal')
export class GoalController {
  constructor(private goalService: GoalService) { }

  @Post()
  @Roles('Admin', 'Teacher')
  create(@Body() createGoal: CreateGoal) {
    return this.goalService.create(createGoal);
  }

  // @Get()
  // findAll(@Query('FK', ParseBoolPipe) fk: boolean) {
  //   return this.goalService.findAll(fk);
  // }

  // @Get(':id')
  // findOne(@Param('id', ParseIntPipe) id: number) {
  //   return this.goalService.findOne(+id);
  // }

  @Patch(':id')
  @Roles('Admin', 'HeadOfDepartment', 'Teacher')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateGoal: UpdateGoal) {
    return this.goalService.update(+id, updateGoal);
  }

  @Delete(':id')
  @Roles('Admin', 'HeadOfDepartment', 'Teacher')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.goalService.remove(+id);
  }
}
