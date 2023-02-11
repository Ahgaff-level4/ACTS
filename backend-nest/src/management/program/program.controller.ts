import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseInterceptors } from '@nestjs/common';
import { CreateProgram,UpdateProgram } from './program.entity';
import { DatabaseService } from 'src/database.service';
import { SuccessInterceptor } from 'src/success.interceptor';
@UseInterceptors(SuccessInterceptor)
@Controller('api/program')
export class ProgramController {
  constructor(private readonly db: DatabaseService) {}

  @Post()
  create(@Body() createProgram: CreateProgram) {
    return this.db.create('program',createProgram);
  }

  @Get()
  findAll() {
    return this.db.select('*','programView');
  }

  @Get(':id')
  findOne(@Param('id',ParseIntPipe) id: number) {
    return this.db.select('*','programView','id=?',[id]);
  }

  @Patch(':id')
  update(@Param('id',ParseIntPipe) id: string, @Body() updateProgram: UpdateProgram) {
    return this.db.update('program',+id, updateProgram);
  }

  @Delete(':id')
  remove(@Param('id',ParseIntPipe) id: string) {
    return this.db.delete('program',+id);
  }
}
