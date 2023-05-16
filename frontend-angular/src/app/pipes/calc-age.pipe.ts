import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({
  name: 'calcAge'
})
export class CalcAgePipe implements PipeTransform {

  /**@returns number of years from provided date until now. IF PROVIDED DATE IS INVALID RETURN `0` */
  transform(value: unknown, ...args: unknown[]): number {
    var date;
    if (value == undefined || value === '')
      return 0;
    if (typeof value === 'string' || typeof value === 'number' || value instanceof Date)
      date = new Date(value);
    else if (moment.isMoment(value))
      date = value;

    if (date) {
      return moment().diff(date, 'years');
    }
    console.warn('DatePipe: called with unexpected value=', date);
    return 0;
  }

}
