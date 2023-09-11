import { Injectable } from '@angular/core';
import { IChildEntity } from '../../../../interfaces';
import { DatePipe } from '../pipes/date/date.pipe';
import { FromNowPipe } from '../pipes/date/from-now.pipe';
import { DateTimeWeekPipe } from '../pipes/date/date-time-week.pipe';
import { BehaviorSubject, first } from 'rxjs';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Location as NgLocation, TitleCasePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Privilege } from './privilege.service';
import { AccountRolesPipe } from '../pipes/account-roles.pipe';
import { CalcAgePipe } from '../pipes/date/calc-age.pipe';
import { ChildTeachersPipe } from '../pipes/child-teachers.pipe';
import { DateWeekPipe } from '../pipes/date/date-week.pipe';
import { TeacherTeachesPipe } from '../pipes/teacher-teaches.pipe';
import { AccountPhonesPipe } from '../pipes/account-phones.pipe';
import { AccountPhonesArrPipe } from '../pipes/account-phones-arr.pipe';
@Injectable({
  providedIn: 'root'
})
export class DisplayService {
  public isLoading = new BehaviorSubject<boolean>(false);
  public ordinalNumbers = ['First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth', 'Seventh', 'Eighth', 'Ninth', 'Tenth', 'Eleventh', 'Twelfth', 'Thirteenth', 'Fourteenth', 'Fifteenth', 'Sixteenth', 'Seventeenth', 'Eighteenth', 'Nineteenth'];

  //pipes are public to be accessible by other components.
  constructor(private translatePipe: TranslatePipe,
    public accountRolesPipe: AccountRolesPipe, public calcAgePipe: CalcAgePipe,
    public childTeachersPipe: ChildTeachersPipe, public toDateTimeWeekPipe: DateTimeWeekPipe,
    public toDateWeekPipe: DateWeekPipe, public toDatePipe: DatePipe, public fromNowPipe: FromNowPipe,
    public teacherTeachesPipe: TeacherTeachesPipe, public accountPhonesPipe: AccountPhonesPipe,
    public accountPhonesArrPipe: AccountPhonesArrPipe, public titleCasePipe: TitleCasePipe,
    private ngLocation: NgLocation, private translateService: TranslateService,) { }






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
   * We recommend using pipe translate (e.g., `<h1>{{title | translate}}</h1>`)
   * @param key key inside the ar.json file. If `null` or `undefined` returns empty string
   * @returns correspond value of the provided key translation base on user's selected language (e.g., 'Login' or 'تسجيل دخول')
   *///some pipes use copy of this function reconsider change them if you wanna change it
  public translate(key: string | null | undefined, ...args: any[]): string {
    if (key === null || key === undefined)
      return '';
    return this.translatePipe.transform(key, args);
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
    let path = this.ngLocation.path(false);
    if (path.includes('?'))
      path = path.substring(0, path.indexOf('?'));
    if (path.includes('#'))
      path = path.substring(0, path.indexOf('#'))
    if (path[path.length - 1] == '/')
      path = path.substring(0, path.length - 1);
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
    title: 'Dashboard',
    link: '/dashboard',
    img: 'assets/img/Continual-goals.svg',
    desc: 'Report & Dashboard',
    privilege: 'dashboard',
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
