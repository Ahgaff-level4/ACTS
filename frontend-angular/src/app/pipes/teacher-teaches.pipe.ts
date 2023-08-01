import { Pipe, PipeTransform } from '@angular/core';
import { IAccountEntity } from '../../../../interfaces';
import { TranslatePipe } from '@ngx-translate/core';

@Pipe({
  name: 'teacherTeaches'
})
export class TeacherTeachesPipe implements PipeTransform {

  constructor(private translatePipe: TranslatePipe) { }

  /** display the children that the teacher teaches, specifically children name array joined by a comma */
  transform(teacher: IAccountEntity): string {
    return teacher.teaches?.map(c => c.person?.name).join(this.translate(', ')) ?? '';
  }

  private translate(key: string | null | undefined, ...args: any[]): string {
    if (key === null || key === undefined)
      return '';
    return this.translatePipe.transform(key, args);
  }
}
