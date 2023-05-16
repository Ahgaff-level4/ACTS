import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';

@Pipe({
  name: 'fromNow'
})

export class FromNowPipe implements PipeTransform {
  constructor(private translate: TranslateService) { }
  /**
   *
   * @param value date object
   * @param args boolean|undefined
   * @returns string user friendly date from now.
   * - If `args==true` Ex: `4 months`, `2 days`.
   * - If `args==undefined` Ex: `4 months ago`, `2 days ago`.
   * - If value is not expected returns empty string.
   */
  transform(value: unknown, ...args: unknown[]): string {
    var date;
    if (value == undefined || value === '')
      return '';
    if (typeof value === 'string' || typeof value === 'number' || value instanceof Date)
      date = new Date(value);
    else if (moment.isMoment(value))
      date = value;

    if (date) {
      moment.locale(this.translate.currentLang === 'ar' ? 'ar-ly' : 'en-gb');
      if (args[0] === true)
        return moment(date).fromNow(true);

      return moment(date).fromNow();
    }
    console.warn('DatePipe: called with unexpected value=', date);
    return '';
  }

}
