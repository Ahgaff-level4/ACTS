import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';

@Pipe({
  name: 'fromNow'
})
export class FromNowPipe implements PipeTransform {
  constructor(private translate: TranslateService) { }
  transform(value: unknown, ...args: unknown[]): unknown {
    var date;
    if (value == undefined || value === '')
      return '';
    if (typeof value === 'string' || typeof value === 'number' || value instanceof Date)
      date = new Date(value);
    else if (moment.isMoment(value))
      date = value;

    if (date) {
      moment.locale(this.translate.currentLang === 'ar' ? 'ar-kw' : 'en');
      if (args[0] === true)
        return moment(date).fromNow(true)
      return moment(date).fromNow();
    }
    console.warn('DatePipe: called with unexpected value=', date);
    return '';
  }

}
