import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SuccessResponse, User, ErrorResponse } from './../../../../interfaces.d';
import { BehaviorSubject, first } from 'rxjs';
import { environment as env } from 'src/environments/environment';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ButtonType, MessageDialogComponent, MessageDialogData } from '../components/dialogs/message/message.component';
import * as moment from 'moment';
import { ActivatedRoute, Router } from '@angular/router';
import { CalcAgePipe } from '../pipes/calc-age.pipe';
import { NotificationService } from './notification.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
@Injectable({
  providedIn: 'root',
})
export class UtilityService {
  public user: BehaviorSubject<User | null> = new BehaviorSubject<User | null>(null);//null means not loggedIn and there is no user info
  public ordinalNumbers = ['First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth', 'Seventh', 'Eighth', 'Ninth', 'Tenth', 'Eleventh', 'Twelfth', 'Thirteenth', 'Fourteenth', 'Fifteenth', 'Sixteenth', 'Seventeenth', 'Eighteenth', 'Nineteenth', 'Twentieth', 'Twenty-first', 'Twenty-second', 'Twenty-third', 'Twenty-fourth', 'Twenty-fifth', 'Twenty-sixth', 'Twenty-seventh', 'Twenty-eighth', 'Twenty-ninth', 'Thirtieth'];
  public isLoading = new BehaviorSubject<boolean>(false);
  /**Used in ag-grid options. So, that we generalize some common columns' options by setting the type of the column with one of these types */
  constructor(private http: HttpClient, private translatePipe: TranslatePipe,
    private calcAgePipe: CalcAgePipe, private dialog: MatDialog,
    public router: Router, private translateService: TranslateService,) {
  }

  /**
   * promise that will return `User` if user is logged in into the server and has its own session in the server.
   * Also, this function will call `user.next(...)` accordingly.
   * Never rejected.
   */
  public isLogin = (): Promise<User | null> => {
    return new Promise<User | null>((resolve) => {
      this.http.get<User>(env.AUTH + 'isLogin').subscribe({
        next: res => {
          if (typeof res?.accountId === 'number' && Array.isArray(res?.roles)) {
            this.user.next(res);
            console.log('ut : isLogin:', res);
            resolve(res);
          } else {
            console.log('ut : isLogin:', res);
            this.user.next(null);
            resolve(null);
          }
        }, error: () => {
          console.log('ut : isLogin:', null);
          this.user.next(null);
          resolve(null);
        }
      });
    });
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
        console.log('param', p);
        if (p && Number.isInteger(+p))
          res(+p);
        else rej();
      })
    })
  }
}

