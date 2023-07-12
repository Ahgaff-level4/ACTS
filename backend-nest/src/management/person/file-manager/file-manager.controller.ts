import { BadRequestException, Controller, Get, Param, ParseIntPipe, Post, Req, Res, UnauthorizedException, UseInterceptors } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { FileManagerService } from './file-manager.service';
import { UserMust } from 'src/utility.service';
import { User } from '../../../../../interfaces';
import { Request, Response } from 'express';
import { Roles } from 'src/auth/Role.guard';
import { PersonEntity } from '../person.entity';
import { resolve } from 'path';
import multer = require('multer');
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('api/person/:id/file-manager')
/**Each person entity has its own folder with the person's id for performance reasons */
export class FileManagerController {

  constructor(@InjectDataSource()
  private dataSource: DataSource,) { }

  @Post('FileOperations')
  //looks like not Angular sending the request so  @UserMust() user: User, will always throw unauthorized exception; angular append user's session-cookies for any request
  // @Roles('Admin', 'HeadOfDepartment')
  async fileOperations(@Param('id', ParseIntPipe) id: number, @Req() req: Request, @Res() res: Response) {
    try {
      await new FileManagerService(personFolderPath(id)).fileOperations(req, res);
    } catch (e) {
      console.trace('FileOperations : Caught an error', e);
    }
  }

  @Get('GetImage')
  async getImage(@Param('id', ParseIntPipe) id: string, @Req() req: Request, @Res() res: Response) {
    try {
      await new FileManagerService(personFolderPath(id)).getImage(req, res);
    } catch (e) {
      console.trace('GetImage : Caught an error', e);
    }
  }


  @Post('Upload')
  @UseInterceptors(FileInterceptor('uploadFiles', {  //specify diskStorage (another option is memory)
    storage: multer.diskStorage({
      //specify destination
      destination: async function (req, file, next) {
        const id = req.params.id;
        if (id && Number.isInteger(+id)) {
          next(null, personFolderPath(id) + '/');
        } else throw new BadRequestException();
      },

      //specify the filename to be unique
      filename: function (req, file, next) {
        // fileName.push(file.originalname);
        if (Array.isArray(req['fileName']))
          req['fileName'].push(file.originalname);
        else req['fileName'] = [file.originalname];
        next(null, file.originalname);
      }
    }),

    // filter out and prevent non-image files.
    fileFilter: function (req, file, next) {
      next(null, true);
    }
  }))
  async upload(@Param('id', ParseIntPipe) id: string, @Req() req: Request, @Res() res: Response) {
    try {

      await new FileManagerService(personFolderPath(id) + '/').upload(req, res);
    } catch (e) {
      console.trace('Upload : Caught an error', e);
    }
  }
}



export function personFolderPath(personId: string | number): string {
  return resolve(process.env.PERSONS_FOLDER_PATH ?? 'persons_folders', personId + '');
}
