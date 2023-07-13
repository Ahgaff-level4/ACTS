import { BadRequestException, Controller, Get, Param, ParseIntPipe, Post, Req, Res, UnauthorizedException, UseInterceptors } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { FileManagerService } from './file-manager.service';
import { Request, Response } from 'express';
import { resolve } from 'path';
import multer = require('multer');
import { FileInterceptor } from '@nestjs/platform-express';
import { createFolderIfNotExists } from './fileOperations.utility';
import { PersonEntity } from '../person.entity';

@Controller('api/person/:id/file-manager')
/**Each person entity has its own folder with the person's id for performance reasons */
export class FileManagerController {

  constructor(@InjectDataSource() private dataSource: DataSource) {
    //make sure the cache folder exists to handle user's files instead of RAM
    createFolderIfNotExists(resolve('cache'))
  }

  @Post('FileOperations')
  //looks like not Angular sending the request so  @UserMust() user: User, will always throw unauthorized exception; angular append user's session-cookies for any request
  // @Roles('Admin', 'HeadOfDepartment')
  async fileOperations(@Param('id', ParseIntPipe) id: number, @Req() req: Request, @Res() res: Response) {
    try {
      await new FileManagerService(personFolderPath(id)).fileOperations(req, res);
    } catch (e) {
      console.trace('FileOperations : body=', req.body, ' : Error=', e);
    }
  }

  @Get('GetImage')
  async getImage(@Param('id', ParseIntPipe) id: string, @Req() req: Request, @Res() res: Response) {
    try {
      await new FileManagerService(personFolderPath(id)).getImage(req, res);
    } catch (e) {
      console.trace('GetImage : body=', req.body, ' : Error=', e);
    }
  }


  @Post('Upload')
  @UseInterceptors(FileInterceptor('uploadFiles', {  //specify diskStorage (another option is memory)
    storage: multer.diskStorage({
      //specify destination
      destination: async function (req, file, next) {
        const id = req.params.id;
        if (id && Number.isInteger(+id)) {
          // console.log('body stringify', JSON.stringify(req.));
          next(null, resolve('cache'));
        } else throw new BadRequestException();
      },

      //specify the filename to be unique
      filename: function (req, file, next) {
        // fileName.push(file.originalname);
        // console.log('file in filename', file);
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
      console.trace('Upload : body=', req.body, ' : Error=', e);
    }
  }

  @Post('Download')
  async download(@Param('id', ParseIntPipe) id: string, @Req() req: Request, @Res() res: Response) {
    try {
      const person = await this.dataSource.getRepository(PersonEntity).findOneByOrFail({ id: +id });
      await new FileManagerService(personFolderPath(id) + '/').download(req, res, person);
    } catch (e) {
      console.trace('Download : body=', req.body, ' : Error=', e);
    }
  }
}



export function personFolderPath(personId: string | number): string {
  return resolve(process.env.PERSONS_FOLDER_PATH ?? 'persons_folders', personId + '');
}
