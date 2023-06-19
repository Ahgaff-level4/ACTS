import { Injectable } from '@angular/core';
import { IAccountEntity, IChildEntity, Role } from '../../../../interfaces';
import { UtilityService } from './utility.service';
import { DatePipe } from '../pipes/date.pipe';
import { FromNowPipe } from '../pipes/from-now.pipe';
import { DateTimeWeekPipe } from '../pipes/date-time-week.pipe';

@Injectable({
  providedIn: 'root'
})
export class DisplayService {

  constructor(private ut: UtilityService,private toDatePipe: DatePipe,
    private fromNowPipe: FromNowPipe,private dateTimeWeekPipe: DateTimeWeekPipe,) { }


  /**User friendly to display a child's teachers name */
  childTeachers(child: IChildEntity | undefined): string {
    if (Array.isArray(child?.teachers))
      return child!.teachers!.map(v => v.person.name).join(this.ut.translate(', '))
    else return '';
  }

  /**Display an account phones joined by a comma. Empty string if none */
  accountPhones(account: IAccountEntity | undefined): string {
    if (!account)
      return '';
    const phones = [];
    for (let i = 0; i < 10; i++)
      phones.push(account['phone' + i]);
    return phones.filter(v => !!v).join(this.ut.translate(', '));
  }


  public accountRoles(roles: Role[]): string {
    return roles.map(v => this.ut.translate(v === 'HeadOfDepartment' ? 'Head of Department' : v)).join(this.ut.translate(', '));
  }

  /**@returns ex: `Third of 5 siblings (2 girls, 3 boys)` */
  public childFamilyInformation(child: IChildEntity) {
    let ret = '';
    if (child.birthOrder != null)
      ret += this.ut.translate(this.ut.ordinalNumbers[child.birthOrder - 1]);
    if (child.maleFamilyMembers != null && child.femaleFamilyMembers != null)
      ret += (child.birthOrder ? ' ' + this.ut.translate('of') : '') + ' ' + (child.maleFamilyMembers + child.femaleFamilyMembers + 1)
        + ' ' + this.ut.translate('siblings');
    if (typeof child.maleFamilyMembers != 'number' && typeof child.femaleFamilyMembers != 'number')
      return ret;
    ret += ' (';
    if (child.femaleFamilyMembers != null)
      ret += (child.femaleFamilyMembers + (child.person?.gender == 'Female' ? 1 : 0)) + ' '
        + this.ut.translate('girls');

    if (child.maleFamilyMembers != null)
      ret += (child.femaleFamilyMembers != null ? this.ut.translate(',') + ' ' : '') + (child.maleFamilyMembers + (child.person?.gender == 'Male' ? 1 : 0))
        + ' ' + this.ut.translate('boys');
    return ret + ')';
  }

  /**
 *
 * @param value date object
 * @param noAgo boolean|undefined
 * @returns string user friendly date from now.
 * - If `noAgo==true` Ex: `4 months`, `2 days`.
 * - If `noAgo==undefined|false` Ex: `4 months ago`, `2 days ago`.
 * - If value is not expected returns empty string.
 */
  public fromNow(value: string | Date | moment.Moment | null | undefined, noAgo?: boolean): string {
    return this.fromNowPipe.transform(value, noAgo) ?? '';
  }

  /**@returns string format as 'yyyy/M/D' */
  public toDate(value: string | Date | moment.Moment | null | undefined): string {
    return this.toDatePipe.transform(value);
  }

  /**@returns string format as 'yyyy/M/D. h:mm A. dddd' */
  public toDateTimeWeek(value: string | Date | moment.Moment | null | undefined): string {
    return this.dateTimeWeekPipe.transform(value);
  }
}
