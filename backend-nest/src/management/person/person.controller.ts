import { Controller, Post, Body, Param, ParseIntPipe, Patch, Delete, UseInterceptors, UploadedFile, Injectable } from '@nestjs/common';
import { CreatePerson, PersonEntity, UpdatePerson } from './person.entity';
import { Roles } from 'src/auth/Role.guard';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { FileInterceptor } from '@nestjs/platform-express';
import { rename, unlink, writeFile } from 'fs/promises';
import { extname, resolve } from 'path';
import { IPersonEntity } from '../../../../interfaces';
import { personFolderName } from './file-manager/file-manager.controller';

@Controller('api/person')
export class PersonController {
  constructor(@InjectRepository(PersonEntity)
  private repo: Repository<PersonEntity>) { }

  @Post()
  @Roles('Admin', 'HeadOfDepartment', 'Teacher')
  @UseInterceptors(FileInterceptor('image'))
  async create(@Body() createPerson: CreatePerson, @UploadedFile() file: Express.Multer.File) {
    console.log('file', file)
    console.log('createPerson', createPerson);
    if (file) {
      //we insert the person first to get the id value
      const person = await this.repo.save(this.repo.create(createPerson));
      const fileName = imageName(person.name, person.id, file.originalname);
      console.log('PersonController : create : fileName:', fileName);
      await writeFile(imagePath(fileName), file.buffer);
      await this.repo.update(person.id, { image: fileName });//set the file name to the person entity
      person.image = fileName;
      return person;
    }
    return this.repo.save(this.repo.create(createPerson));
  }

  @Patch(':id')
  @Roles('Admin', 'HeadOfDepartment')
  @UseInterceptors(FileInterceptor('image'))
  async update(@Param('id', ParseIntPipe) id: string, @Body() updatePerson: UpdatePerson, @UploadedFile() file: Express.Multer.File) {
    console.log('id', id, 'updatePerson', updatePerson, 'file', file);
    //THIS IS OVER ENGINEERING :)
    const originalPerson: IPersonEntity = await this.repo.findOneBy({ id: +id });
    let res;
    if (originalPerson.image) {//update image name
      const oldImageName = originalPerson.image;
      const newImageName = imageName(updatePerson.name ?? originalPerson.name, id, file?.originalname ?? originalPerson.image);
      await rename(imagePath(oldImageName), imagePath(newImageName));//rename the image file name
      res = await this.repo.update(id, { image: newImageName });
    }
    if (file) {//update image data
      const fileName = imageName(updatePerson.name ?? originalPerson.name, originalPerson.id, file.originalname);
      await writeFile(imagePath(fileName), file.buffer);
      if (fileName != originalPerson.image)
        res = await this.repo.update(id, { image: fileName });
    }
    return Object.keys(updatePerson).length == 0 ? res : this.repo.update(id, updatePerson);
  }

  @Delete(':id')
  @Roles('Admin', 'HeadOfDepartment')
  async remove(@Param('id', ParseIntPipe) id: string) {
    const person: IPersonEntity = await this.repo.findOneBy({ id: +id });
    console.log('delete person', person)
    if (person.image) {//if it has image then delete it
      await unlink(imagePath(person.image));
      console.log('image deleted')
    }
    return this.repo.delete(id);
  }

}

/**
 * @param fileOriginalName is used to know the file extension only. 
 * You can provide the file extension here as `a.jpeg` where `a` can be any letter 
 * but it should exist because the extraction process do not look for the first letter
 * and if the first letter is dot `.` then the imageName won't have an extension!! 
 * @see {@link extname}
 * @returns image file name with its extension as `personName-personId.png` */
function imageName(personName: string, personId: string | number, fileOriginalName: string): string {
  //Windows file names has some constraints (*/\...etc) so we use `sanitize` to make the file name compatible
  return personFolderName(personName, personId) + `${extname(fileOriginalName)}`;
}




/**@returns the absolute path of images folder path and suffix the provided image name. 
 * Ex: `C:/.../person-images/imageName` */
export function imagePath(imageName: string): string {
  return resolve((process.env.PRODUCTION == "false" ? '../frontend-angular/src/' : 'dist-angular') + '/assets/person-images/', imageName);
}

/**
 * 
 */