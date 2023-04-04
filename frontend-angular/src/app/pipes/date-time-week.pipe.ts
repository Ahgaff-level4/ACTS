import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';

@Pipe({
  name: 'toDateTimeWeek'
})
export class DateTimeWeekPipe implements PipeTransform {
  constructor(private translate: TranslateService) { }
  transform(value: unknown, ...args: unknown[]): unknown {
    var date;
    if (value != '')
      if (typeof value === 'string' || typeof value === 'number' || value instanceof Date)
        date = new Date(value);
    if (date) {
      moment.locale(this.translate.currentLang === 'ar' ? 'ar-kw' : 'en');
      return moment(date).format('yyyy/M/D. h:mm A. dddd');
    }
    console.warn('DatePipe: called with unexpected value=', date);
    return '';
  }

}
