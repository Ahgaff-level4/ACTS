import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, ParseIntPipe } from '@nestjs/common';
import { ChildService } from './child.service';
import { SuccessInterceptor } from 'src/SuccessInterceptor';
import { CreateChild, UpdateChild } from './child.entity';

@UseInterceptors(SuccessInterceptor)
@Controller('api/child')
export class ChildController {
  constructor(private readonly childService: ChildService) {}

  @Post()
  create(@Body() createChild: CreateChild) {
    return this.childService.create(createChild);
  }

  @Get()
  findAll() {
    return this.childService.findAll();
  }

  @Get(':id')
  findOne(@Param('id',ParseIntPipe) id: number) {
    return this.childService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id',ParseIntPipe) id: number, @Body() updateChild: UpdateChild) {
    return this.childService.update(+id, updateChild);
  }

  @Delete(':id')
  remove(@Param('id',ParseIntPipe) id: number) {
    return this.childService.remove(+id);
  }
}
