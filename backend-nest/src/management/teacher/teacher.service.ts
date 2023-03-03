import { Injectable } from '@nestjs/common';
import { CreateTeacher, TeacherEntity, UpdateTeacher } from './teacher.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccountView } from '../account/account.entity';

@Injectable()
export class TeacherService {
  constructor(@InjectRepository(TeacherEntity) private repo:Repository<TeacherEntity>) { }

  create(createTeacher: CreateTeacher) {
    return this.repo.save(this.repo.create(createTeacher))
  }

  async findAll(fk: boolean) {
    if (fk)
      return this.repo
      .createQueryBuilder('teacher')
      .leftJoinAndMapOne('teacher.account', AccountView, 'account', 'teacher.accountId=account.id')
      .getMany();
    else return this.repo.find();
  }

  async findOne(id: number) {
    return this.repo
      .createQueryBuilder('teacher')
      .leftJoinAndMapOne('teacher.account', AccountView, 'account', 'teacher.accountId=account.id')
      .where('teacher.id=:id',{id})
      .getMany();
  }

  update(id: number, updateTeacher: UpdateTeacher) {
    return this.repo.update(id,updateTeacher);
  }

  remove(id: number) {
    return this.repo.delete(id);
  }
}