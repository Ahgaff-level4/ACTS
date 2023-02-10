import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, Query } from '@nestjs/common';
import { HdService } from './hd.service';
import { ParseBoolPipe, ParseIntPipe } from '@nestjs/common/pipes';
import { CreateHd, UpdateHd } from './hd.entity';
import { SuccessInterceptor } from 'src/Success.interceptor';

@UseInterceptors(SuccessInterceptor)
@Controller('api/hd')
export class HdController {
  constructor(private readonly hdService: HdService) {}

  @Post()
  create(@Body() createHd: CreateHd) {
    return this.hdService.create(createHd);
  }

  @Get()
  findAll(@Query('FK',ParseBoolPipe) fk:boolean) {
    return this.hdService.findAll(fk);
  }

  @Get(':id')
  findOne(@Param('id',ParseIntPipe) id: number) {
    return this.hdService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id',ParseIntPipe) id: number, @Body() updateHd: UpdateHd) {
    return this.hdService.update(+id, updateHd);
  }

  @Delete(':id')
  remove(@Param('id',ParseIntPipe) id: number) {
    return this.hdService.remove(+id);
  }
}
