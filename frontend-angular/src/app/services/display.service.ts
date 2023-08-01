import { Injectable } from '@angular/core';
import { IAccountEntity, IChildEntity, Role } from '../../../../interfaces';
import { DatePipe } from '../pipes/date.pipe';
import { FromNowPipe } from '../pipes/from-now.pipe';
import { DateTimeWeekPipe } from '../pipes/date-time-week.pipe';
import { BehaviorSubject, first } from 'rxjs';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { CalcAgePipe } from '../pipes/calc-age.pipe';
import { Location as NgLocation } from '@angular/common';
import * as moment from 'moment';
import { ActivatedRoute, Router } from '@angular/router';
import { Privilege } from './privilege.service';
@Injectable({
  providedIn: 'root'
})
export class DisplayService {
  public isLoading = new BehaviorSubject<boolean>(false);
  public ordinalNumbers = ['First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth', 'Seventh', 'Eighth', 'Ninth', 'Tenth', 'Eleventh', 'Twelfth', 'Thirteenth', 'Fourteenth', 'Fifteenth', 'Sixteenth', 'Seventeenth', 'Eighteenth', 'Nineteenth'];

  constructor(private toDatePipe: DatePipe,
    private fromNowPipe: FromNowPipe, private dateTimeWeekPipe: DateTimeWeekPipe,
    private translatePipe: TranslatePipe, private calcAgePipe: CalcAgePipe,
    private ngLocation: NgLocation, private translateService: TranslateService,) { }

  /**User friendly to display a child's teachers name */
  childTeachers(child: IChildEntity | undefined): string {
    if (Array.isArray(child?.teachers))
      return child!.teachers!.map(v => v.person.name).join(this.translate(', '))
    else return '';
  }

  /**Display an account phones joined by a comma. Empty string if none */
  accountPhones(account: IAccountEntity | undefined): string {
    const phones = this.accountPhonesArr(account);
    if (phones.length == 0)
      return '';
    return phones.filter(v => !!v).join(this.translate(', '));
  }

  accountPhonesArr(account: IAccountEntity | undefined): string[] {
    if (!account)
      return [];
    const phones = [];
    for (let i = 0; i < 10; i++)
      phones.push(account['phone' + i]);
    return phones;
  }


  public accountRoles(roles: Role[]): string {
    return roles.map(v => this.translate(v === 'HeadOfDepartment' ? 'Head of Department' : v)).join(this.translate(', '));
  }

  /**@returns ex: `Third of 5 siblings (2 girls, 3 boys)` */
  public childFamilyInformation(child: IChildEntity) {
    let ret = '';
    if (child.birthOrder != null)
      ret += this.translate(this.ordinalNumbers[child.birthOrder - 1]);
    if (child.maleFamilyMembers != null && child.femaleFamilyMembers != null)
      ret += (child.birthOrder ? ' ' + this.translate('of') : '') + ' ' + (child.maleFamilyMembers + child.femaleFamilyMembers + 1)
        + ' ' + this.translate('siblings');
    if (typeof child.maleFamilyMembers != 'number' && typeof child.femaleFamilyMembers != 'number')
      return ret;
    ret += ' (';
    if (child.femaleFamilyMembers != null)
      ret += (child.femaleFamilyMembers + (child.person?.gender == 'Female' ? 1 : 0)) + ' '
        + this.translate('girls');

    if (child.maleFamilyMembers != null)
      ret += (child.femaleFamilyMembers != null ? this.translate(',') + ' ' : '') + (child.maleFamilyMembers + (child.person?.gender == 'Male' ? 1 : 0))
        + ' ' + this.translate('boys');
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

  /** display the children that the teacher teaches, specifically children name array joined by a comma */
  accountTeaches(teacher: IAccountEntity): string {
    return teacher.teaches?.map(c => c.person?.name).join(this.translate(', ')) ?? '';
  }

  //use titleCase built in pipe if you want titleCase in an html
  titleCase(n: string): string {
    return n.split('').map((v, i) => (i == 0 ? v.toUpperCase() : v)).join('');
  }

  /**
   * We recommend using pipe translate (e.g., `<h1>{{title | translate}}</h1>`)
   * @param key key inside the ar.json file. If `null` or `undefined` returns empty string
   * @returns correspond value of the provided key translation base on user's selected language (e.g., 'Login' or 'تسجيل دخول')
   */
  public translate(key: string | null | undefined, ...args: any[]): string {
    if (key === null || key === undefined)
      return '';
    return this.translatePipe.transform(key, args);
  }

  /**
   * @returns number of years from provided date until now.
   * NOTE: IF PROVIDED DATE IS INVALID THEN IT RETURNS `0` */
  public calcAge(value: string | Date | moment.Moment | null | undefined): number {
    return this.calcAgePipe.transform(value);
  }

  public get currentLang(): 'ar' | 'en' {
    return this.translateService.currentLang.includes('ar') ? 'ar' : 'en'
  }

  /**
   * @param obj array or object
   * @returns the same array or object with different reference address AKA ` obj != deepClone(obj)` and its properties object/array
   */
  public deepClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj))
  }

  public getDirection(): 'ltr' | 'rtl' {
    return this.currentLang.toLowerCase().includes('ar') ? 'rtl' : 'ltr';
  }

  getRouteParamId(route: ActivatedRoute, param: string = 'id'): Promise<number> {
    return new Promise((res, rej) => {
      route.paramMap.pipe(first()).subscribe(v => {
        const p = v.get(param);
        if (p && Number.isInteger(+p))
          res(+p);
        else rej();
      })
    })
  }

  getActivePage(): IPage | undefined {
    const path = this.ngLocation.path(false);
    let lastSegment = path.split('/')[path.split('/').length - 1];
    return PAGES.find(v => v.link.replace('/', '') == lastSegment)
  }
}



/**First page should be Home; used in home's cards.
 * Last page should be Settings; used in header and footer links.
 */
export const PAGES: IPage[] = [
  {
    title: 'Home',
    link: '/',
    img: 'assets/img/logo.png',
    desc: 'Home page',
  },
  {
    title: 'Children',
    link: '/children',
    img: 'assets/img/girl.svg', alt: 'girl photo',
    desc: 'Children information',
    privilege: 'childrenPage'
  },
  {
    title: "Programs",
    img: "assets/img/Program.svg",
    link: "/programs",
    desc: "Programs information",
    privilege: 'programsPage'
  },
  {
    title: "Fields",
    img: "assets/img/Field.svg",
    link: "/fields",
    desc: "Fields information",
    privilege: 'fieldsPage'
  },
  {
    title: "Special Activities",
    img: "assets/img/Activity.svg",
    link: "/special-activities",
    desc: "Special Activities information",
    privilege: 'specialActivitiesPage'
  },
  {
    title: 'Accounts',
    link: '/accounts',
    img: 'assets/img/Account.svg',
    desc: 'Manage all users accounts',
    privilege: 'accountsPage'
  },
  {
    title: 'About Us',
    link: '/about',
    img: 'assets/img/logo.png',
    desc: 'Who we are?',
    privilege: 'notLoggedIn'
  },
  {
    title: 'Settings',
    link: '/settings',
    img: 'assets/img/Setting.svg',
    desc: 'Settings and preferences',
  },
];

export interface IPage {
  title: string,
  link: string,
  img: string,
  alt?: string,
  desc: string,
  fragment?: string,
  privilege?: Privilege
}
