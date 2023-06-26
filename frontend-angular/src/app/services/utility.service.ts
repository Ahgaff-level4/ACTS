import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, first } from 'rxjs';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { ActivatedRoute, Router } from '@angular/router';
import { CalcAgePipe } from '../pipes/calc-age.pipe';
import { Privilege } from './privilege.service';
@Injectable({
  providedIn: 'root',
})
export class UtilityService {
  public ordinalNumbers = ['First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth', 'Seventh', 'Eighth', 'Ninth', 'Tenth', 'Eleventh', 'Twelfth', 'Thirteenth', 'Fourteenth', 'Fifteenth', 'Sixteenth', 'Seventeenth', 'Eighteenth', 'Nineteenth', 'Twentieth', 'Twenty-first', 'Twenty-second', 'Twenty-third', 'Twenty-fourth', 'Twenty-fifth', 'Twenty-sixth', 'Twenty-seventh', 'Twenty-eighth', 'Twenty-ninth', 'Thirtieth'];
  public isLoading = new BehaviorSubject<boolean>(false);
  /**Used in ag-grid options. So, that we generalize some common columns' options by setting the type of the column with one of these types */
  constructor(private http: HttpClient, private translatePipe: TranslatePipe,
    private calcAgePipe: CalcAgePipe,
    public router: Router, private translateService: TranslateService,) {
  }



  /**
   * We recommend using pipe translate (e.g., `<h1>{{title | translate}}</h1>`)
   * @param key key inside the ar.json file. If `null` or `undefined` returns empty string
   * @returns correspond value of the provided key translation (e.g., 'Login' or 'تسجيل دخول')
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
}

/**First page should be Home; used in home's cards.
 * Last page should be Settings; used in header and footer links.
 */
export const PAGES: IPage[] = [
  {
    title: 'Home',
    link:'/',
    img:'assets/img/logo.png',
    desc:'Home page',
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
    link: "/program",
    desc: "Programs information",
    privilege: 'programsPage'
  },
  {
    title: "Fields",
    img: "assets/img/Field.svg",
    link: "/field",
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
    link: '/account',
    img: 'assets/img/Account.svg',
    desc: 'Manage all users accounts',
    privilege: 'accountsPage'
  },
  {
    title: 'Settings',
    link: '/settings',
    img: 'assets/img/Setting.svg',
    desc: 'Settings and preference',
  },
];

export interface IPage {
  title: string,
  link: string,
  img: string,
  alt?: string,
  desc: string,
  privilege?: Privilege
}
