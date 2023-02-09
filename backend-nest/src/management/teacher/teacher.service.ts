import { Injectable } from '@nestjs/common';
import { CreateTeacher, UpdateTeacher } from './teacher.entity';
import { DatabaseService } from 'src/database.service';

@Injectable()
export class TeacherService {
  constructor(private db: DatabaseService) { }

  create(createTeacher: CreateTeacher) {
    return this.db.create('teacher', createTeacher);
  }

  async findAll(fk: boolean) {
    if (fk)
      return this.db.selectJoin(['teacher', 'accountView'])
    else return this.db.select('*', 'teacher')
  }

  async findOne(id: number) {
    return this.db.selectJoinOne(['teacher', 'accountView'], id)
  }

  update(id: number, updateTeacher: UpdateTeacher) {
    return this.db.update('teacher', id, updateTeacher);
  }

  remove(id: number) {
    return this.db.delete('teacher',id);
  }
}