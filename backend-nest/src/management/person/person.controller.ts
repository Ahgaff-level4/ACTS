import { Controller, Post, Body, Param, ParseIntPipe, Patch, Delete, UseInterceptors, UploadedFile, Injectable } from '@nestjs/common';
import { CreatePerson, PersonEntity, UpdatePerson } from './person.entity';
import { Roles } from 'src/auth/Role.guard';
import { DataSource, Repository } from 'typeorm';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { FileInterceptor } from '@nestjs/platform-express';
import { rename, unlink, writeFile } from 'fs/promises';
import { extname, resolve } from 'path';
import { IPersonEntity } from '../../../../interfaces';
import sanitize = require('sanitize-filename');
import { NotContains, NotEquals } from 'class-validator';
import { ChildEntity } from '../child/child.entity';
import { AccountEntity } from '../account/account.entity';

@Controller('api/person')
export class PersonController {
  constructor(@InjectRepository(PersonEntity)
  private repo: Repository<PersonEntity>, @InjectDataSource() dataSource: DataSource) {

    //Delete unused person entities. Person is used as child or account. It can be generated without any relations if something went wrong like deadlock error. Happened to me :)
    Promise.all([
      this.repo.find({ select: { id: true } }),
      dataSource.getRepository(ChildEntity).find({ relations: ['person'], select: { person: { id: true } } }),
      dataSource.getRepository(AccountEntity).find({ relations: ['person'], select: { person: { id: true } } })
    ])
      .then(v => {
        const allPersons = v[0];
        const childPersons = v[1];
        const accountPersons = v[2];
        const alonePersons = allPersons
          .filter(p => !childPersons.map(c => c.person.id).includes(p.id))
          .filter(p => !accountPersons.map(a => a.person.id).includes(p.id));
        if (alonePersons.length > 0)
          this.repo.delete(alonePersons.map(v => v.id));
      });
  }

  @Post()
  @Roles('Admin', 'HeadOfDepartment', 'Teacher')
  @UseInterceptors(FileInterceptor('image'))
  async create(@Body() createPerson: CreatePerson, @UploadedFile() file: Express.Multer.File) {
    if (file) {
      //we insert the person first to get the id value
      const person = await this.repo.save(this.repo.create(createPerson));
      const fileName = imageName(person.name, person.id, file.originalname);
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
    //THIS IS OVER ENGINEERING :)
    //Scenarios:
    //1. update all person data except image.
    //2. update only person image.
    //3. update all person data with image.
    const originalPerson: IPersonEntity = await this.repo.findOneBy({ id: +id });
    let res;
    if (file) {
      const newImageName = imageName(updatePerson.name ?? originalPerson.name, id, file.originalname);
      if (originalPerson.image)
        await rename(imagePath(originalPerson.image), imagePath(newImageName));//rename the image file name
      await writeFile(imagePath(newImageName), file.buffer);
      res = await this.repo.update(id, { image: newImageName });
    }

    //update person data if exist, else is when 
    return Object.keys(updatePerson).length == 0 ? res : this.repo.update(id, updatePerson);
  }

  @Delete(':id')
  @Roles('Admin', 'HeadOfDepartment')
  async remove(@Param('id', ParseIntPipe) id: string) {
    const person: IPersonEntity = await this.repo.findOneBy({ id: +id });
    if (person.image) {//if it has image then delete it
      await unlink(imagePath(person.image));
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
 * @returns image file name with its extension as `personId.png` */
function imageName(personName: string, personId: string | number, fileOriginalName: string): string {
  // Windows file names has some constraints (*/\...etc) so we use `sanitize` to make the file name compatible
  return `${sanitize(personName)}-${personId}${extname(fileOriginalName)}`;
}




/**@returns the absolute path of images folder path and suffix the provided image name. 
 * Ex: `C:/.../person-images/imageName` */
export function imagePath(imageName: string): string {
  return resolve((process.env.PRODUCTION == "false" ? '../frontend-angular/src/' : 'dist-angular') + '/assets/person-images/', imageName);
}

/**
 * 
 */