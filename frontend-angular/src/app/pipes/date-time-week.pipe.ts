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
    if (value == undefined || value === '')
      return '';
    if (typeof value === 'string' || typeof value === 'number' || value instanceof Date)
      date = new Date(value);
    else if (moment.isMoment(value))
      date = value;

    if (date) {
      moment.locale(this.translate.currentLang === 'ar' ? 'ar-ly' : 'en-gb');
      return moment(date).format('yyyy/M/D. h:mm A. dddd');
    }
    console.warn('DatePipe: called with unexpected value=', date);
    return '';
  }

}
