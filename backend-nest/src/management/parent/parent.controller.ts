import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors } from '@nestjs/common';
import { ParentService } from './parent.service';
import { ParseIntPipe } from '@nestjs/common/pipes';
import { CreateParent, UpdateParent } from './parent.entity';
import { SuccessInterceptor } from 'src/SuccessInterceptor';

@UseInterceptors(SuccessInterceptor)
@Controller('api/parent')
export class ParentController {
  constructor(private readonly parentService: ParentService) {}

  @Post()
  create(@Body() createParent: CreateParent) {
    return this.parentService.create(createParent);
  }

  @Get()
  findAll() {
    return this.parentService.findAll();
  }

  @Get(':id')
  findOne(@Param('id',ParseIntPipe) id: number) {
    return this.parentService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id',ParseIntPipe) id: number, @Body() updateParent: UpdateParent) {
    return this.parentService.update(+id, updateParent);
  }

  @Delete(':id')
  remove(@Param('id',ParseIntPipe) id: number) {
    return this.parentService.remove(+id);
  }
}
