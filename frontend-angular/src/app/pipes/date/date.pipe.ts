import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({
  name: 'toDate'
})
export class DatePipe implements PipeTransform {

  /**@returns string format as 'yyyy/M/D' */
  transform(value: Date | string | null | undefined): string {
    var date;
    if (value == undefined || value === '')
      return '';
    if (typeof value === 'string' || typeof value === 'number' || value instanceof Date)
      date = new Date(value);
    else if (moment.isMoment(value))
      date = value;

    if (date)
      return moment(date).format('yyyy/M/D');
    return '';
  }

}
