import { Controller, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ParseIntPipe } from '@nestjs/common/pipes';
import { CreateEvaluation, EvaluationEntity, UpdateEvaluation } from './evaluation.entity';
import { Roles } from 'src/auth/Role.guard';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Controller('api/evaluation')
export class EvaluationController {
  constructor(@InjectRepository(EvaluationEntity) private repo: Repository<EvaluationEntity>) { }

  @Post()
  @Roles('Admin', 'Teacher')
  create(@Body() createEvaluation: CreateEvaluation) {
      return this.repo.save(this.repo.create(createEvaluation));
  }

  @Patch(':id')
  @Roles('Admin', 'Teacher', 'HeadOfDepartment')
  async update(@Param('id', ParseIntPipe) id: number, @Body() updateEvaluation: UpdateEvaluation) {
    return this.repo.update(id,updateEvaluation);
  }

  @Delete(':id')
  @Roles('Admin', 'Teacher', 'HeadOfDepartment')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.repo.delete(id);
  }
}
