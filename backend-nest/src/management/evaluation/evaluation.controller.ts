import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, Query } from '@nestjs/common';
import { EvaluationService } from './evaluation.service';
import { ParseBoolPipe, ParseIntPipe } from '@nestjs/common/pipes';
import { CreateEvaluation, UpdateEvaluation } from './evaluation.entity';
import { SuccessInterceptor } from 'src/SuccessInterceptor';

@UseInterceptors(SuccessInterceptor)
@Controller('api/evaluation')
export class EvaluationController {
  constructor(private evaluationService: EvaluationService) {}

  @Post()
  create(@Body() createEvaluation: CreateEvaluation) {
    return this.evaluationService.create(createEvaluation);
  }

  @Get()
  findAll(@Query('FK',ParseBoolPipe) fk:boolean) {
    return this.evaluationService.findAll(fk);
  }

  @Get(':id')
  findOne(@Param('id',ParseIntPipe) id: number) {
    return this.evaluationService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id',ParseIntPipe) id: number, @Body() updateEvaluation: UpdateEvaluation) {
    return this.evaluationService.update(+id, updateEvaluation);
  }

  @Delete(':id')
  remove(@Param('id',ParseIntPipe) id: number) {
    return this.evaluationService.remove(+id);
  }
}
