import { Pipe, PipeTransform } from '@angular/core';
import { IChildEntity } from '../../../../interfaces';
import { DisplayService } from '../services/display.service';
import { TranslatePipe } from '@ngx-translate/core';

@Pipe({
  name: 'childTeachers'
})
/**User friendly to display a child's teachers name */
export class ChildTeachersPipe implements PipeTransform {

  constructor(private translatePipe: TranslatePipe) { }

  /**User friendly to display a child's teachers name */
  transform(child: IChildEntity | undefined): string {
    if (Array.isArray(child?.teachers))
      return child!.teachers!.map(v => v.person?.name).join(this.translate(', '))
    else return '';
  }
  private translate(key: string | null | undefined, ...args: any[]): string {
    if (key === null || key === undefined)
      return '';
    return this.translatePipe.transform(key, args);
  }
}
