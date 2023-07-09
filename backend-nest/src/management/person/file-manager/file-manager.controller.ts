import { BadRequestException, Controller, Get, Param, Post, Req, Res, UnauthorizedException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { FileManagerService } from './file-manager.service';
import { UserMust } from 'src/utility.service';
import { User } from '../../../../../interfaces';
import { Request, Response } from 'express';
import { Roles } from 'src/auth/Role.guard';
import { PersonEntity } from '../person.entity';
import sanitize = require('sanitize-filename');
import { resolve } from 'path';

@Controller('api/person/:id/file-manager')
export class FileManagerController {
  constructor(@InjectDataSource()
  private dataSource: DataSource,) { }

  @Post('FileOperations')
  //looks like not Angular sending the request so  @UserMust() user: User, will always throw unauthorized exception; angular append user's session-cookies for any request
  // @Roles('Admin', 'HeadOfDepartment')
  async fileOperations(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
    if (id && Number.isInteger(+id)) {
      const person: PersonEntity = await this.dataSource.getRepository(PersonEntity).findOneByOrFail({ id: +id });

      new FileManagerService(personFolderPath(person.name, person.id) + '/').fileOperations(req, res);

    } else
      throw new BadRequestException();
  }
}

export function personFolderName(personName: string, personId: string | number) {
  return `${sanitize(personName)}-${personId}`;
}

export function personFolderPath(personName: string, personId: string | number) {
  return resolve(process.env.PERSONS_FOLDER_PATH ?? 'persons_folders', personFolderName(personName, personId));
}