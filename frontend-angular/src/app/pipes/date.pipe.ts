import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({
  name: 'toDate'
})
export class DatePipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): string {
    var date;
    if (value != '')
      if (typeof value === 'string' || typeof value === 'number' || value instanceof Date)
        date = new Date(value);
    if (date)
      return moment(date).format('yyyy/M/D')
    console.warn('DatePipe: called with unexpected value=', date);
    return '';
  }

}
