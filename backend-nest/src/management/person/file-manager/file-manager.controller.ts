import { Controller, Get, Param } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';

@Controller('api/person/:id/file-manager')
export class FileManagerController {
  constructor(@InjectDataSource()
  private dataSource: DataSource) { }

  @Get()
  async create(@Param('id') id: string) {
    return { urlProvided: 'api/person/' + id + '/file-manager' };
  }
}
