import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, Query } from '@nestjs/common';
import { GoalService } from './goal.service';
import { ParseBoolPipe, ParseIntPipe } from '@nestjs/common/pipes';
import { CreateGoal, UpdateGoal } from './goal.entity';
import { SuccessInterceptor } from 'src/success.interceptor';

@UseInterceptors(SuccessInterceptor)
@Controller('api/goal')
export class GoalController {
  constructor(private goalService: GoalService) {}

  @Post()
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
  update(@Param('id',ParseIntPipe) id: number, @Body() updateGoal: UpdateGoal) {
    return this.goalService.update(+id, updateGoal);
  }

  @Delete(':id')
  remove(@Param('id',ParseIntPipe) id: number) {
    return this.goalService.remove(+id);
  }
}