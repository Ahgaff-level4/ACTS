import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Role, SuccessResponse, User, ErrorResponse, IChildEntity } from './../../../../interfaces.d';
import { BehaviorSubject } from 'rxjs';
import { environment as env } from 'src/environments/environment';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ButtonType, MessageDialogComponent, MessageDialogData } from '../components/dialogs/message/message.component';
import * as moment from 'moment';
import { AbstractControl, FormControl, FormGroup, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { FromNowPipe } from '../pipes/from-now.pipe';
import { CalcAgePipe } from '../pipes/calc-age.pipe';
import { DatePipe } from '../pipes/date.pipe';
import { DateTimeWeekPipe } from '../pipes/date-time-week.pipe';
import { NzNotificationService } from 'ng-zorro-antd/notification';
@Injectable({
  providedIn: 'root'
})
export class UtilityService {
  public user: BehaviorSubject<User | null> = new BehaviorSubject<User | null>(null);//null means not loggedIn and there is no user info
  public ordinalNumbers = ['First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth', 'Seventh', 'Eighth', 'Ninth', 'Tenth', 'Eleventh', 'Twelfth', 'Thirteenth', 'Fourteenth', 'Fifteenth', 'Sixteenth', 'Seventeenth', 'Eighteenth', 'Nineteenth', 'Twentieth', 'Twenty-first', 'Twenty-second', 'Twenty-third', 'Twenty-fourth', 'Twenty-fifth', 'Twenty-sixth', 'Twenty-seventh', 'Twenty-eighth', 'Twenty-ninth', 'Thirtieth'];
  public isLoading = new BehaviorSubject<boolean>(false);
  public notifySettings = new BehaviorSubject<{ allowNotification: boolean, closeAfter: number }>(JSON.parse(localStorage.getItem('notifySettings') ?? 'null') ?? { allowNotification: true, closeAfter: 10000 });
  /**Used in ag-grid options. So, that we generalize some common columns' options by setting the type of the column with one of these types */

  constructor(private http: HttpClient, private translatePipe: TranslatePipe,
    private toDatePipe: DatePipe, private calcAgePipe: CalcAgePipe,
    private fromNowPipe: FromNowPipe, private dialog: MatDialog,
    public router: Router, private translateService: TranslateService,
    private dateTimeWeekPipe: DateTimeWeekPipe, private notificationService: NzNotificationService) {
  }

  /**
   * promise will be fulfilled and user.next(...) will be called if user is login. otherwise rejected.
   */
  public isLogin = () => {
    return new Promise<void>((resolve, rej) => {
      this.http.get<User>(env.AUTH + 'isLogin').subscribe({
        next: res => {
          if (typeof res?.accountId === 'number' && Array.isArray(res?.roles)) {
            this.user.next(res);
            resolve();
          } else {
            this.user.next(null);
            rej();
          }
        }, error: () => {
          this.user.next(null);
          rej();
        }
      });
    });
  }


  /**
   * Display error dialog with message of:
   * - if `HttpErrorResponse` then extract the error `message`.
   * - if string then message is `eOrMessage`.
   * - else show default message (e.g., 'Something Went Wrong!') followed by `appendMsg` if exist.
   * @param eOrMessage
   * @param appendMsg used when error could not be identified and will be appended after the default error message: `'Something Went Wrong! '+appendMsg`
   */
  public errorDefaultDialog = (eOrMessage?: HttpErrorResponse | string | ErrorResponse | SuccessResponse, appendMsg?: string): MatDialogRef<MessageDialogComponent, any> => {
    console.warn('UtilityService : errorDefaultDialog : eOrMessage:', eOrMessage);

    let message: string;
    if (typeof eOrMessage === 'string')
      message = eOrMessage;
    else if (eOrMessage instanceof HttpErrorResponse && eOrMessage?.error?.message)
      message = eOrMessage.error.message;
    else if (typeof (eOrMessage as ErrorResponse)?.success === 'boolean'
      && typeof (eOrMessage as ErrorResponse)?.message === 'string')
      message = eOrMessage?.message;
    else
      message = this.translatePipe.transform('Something went wrong!') + ' ' + (appendMsg ? this.translatePipe.transform(appendMsg) : this.translatePipe.transform('Sorry, there was a problem. Please try again later or check your connection.'));

    return this.showMsgDialog({ content: message, type: 'error' })
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

  /**
   * @returns number of years from provided date until now.
   * NOTE: IF PROVIDED DATE IS INVALID THEN IT RETURNS `0` */
  public calcAge(value: string | Date | moment.Moment | null | undefined): number {
    return this.calcAgePipe.transform(value);
  }

  /**
   *
   * @param data structure of the message dialog
   * @returns MatDialogRef. Value when close is the button type clicked.
   */
  public showMsgDialog(data: MessageDialogData) {
    return this.dialog
      .open<MessageDialogComponent, MessageDialogData, ButtonType>(MessageDialogComponent, { data, direction: this.getDirection() });
  }

  /**
   * @return `true` if user's roles has any one role of the param `roles`. If user has no role overlap with param `roles` then return `false`
   */
  public userHasAny(...roles: Role[]) {
    if (this.user.value)
      for (let r of this.user.value.roles)
        if (roles.includes(r))
          return true;

    return false;
  }

  /**
   * Used in formGroup to setValue of formGroup.controls with the correspond object properties.
   * Ex: `keys={'name':FormControl...}` and `properties={'name':'Ahmad','age':20,...}`
   * return `{'name':'Ahmad'}` and ignore any other property in `properties` param
   * @param keys
   * @param properties
   */
  public extractFrom(keys: { [key: string]: any }, properties: { [key: string]: any }) {
    let ret: { [key: string]: any } = {};
    if (!keys || !properties)
      console.error('Unexpected param!', keys, properties)
    for (let k in keys) {
      ret[k] = properties[k] ?? null;
    }
    return ret;
  }

  /**
   * Used to send the changed fields to the server.
   * @param controls formGroup.controls
   * @returns the only changed fields of the entity that formGroup represent OR null if there is no change instead of empty object `{}`
   */
  public extractDirty(controls: { [key: string]: AbstractControl<any, any> }): { [key: string]: any } | null {
    let ret: { [key: string]: any } = {};
    for (let key in controls)
      if (controls[key].dirty) {
        ret[key] = controls[key].value;
        if (typeof ret[key] == 'string' && key != 'password')
          ret[key] = ret[key].toString();
        if (ret[key] instanceof moment || moment.isMoment(ret[key]))
          ret[key] = ret[key].toDate().toISOString();
      }

    console.log('extractDirty', ret);
    return Object.keys(ret).length == 0 ? null : ret;
  }

  /**
   * loop for each control in the passed formGroup and trim the value
   */
  public trimFormGroup(formGroup: FormGroup) {
    if (formGroup)
      Object.keys(formGroup.controls).forEach(key => {
        const control = formGroup.get(key);
        if (control && typeof control.value === 'string')
          control.setValue(control.value.trim());
      });
  }



  /**
   * If title is null then show error message of something went wrong!
   * @param title will be translated
   * @param content will be translated
   * @param type  notification icon will be based on the type or 'undefined'/'blank' for no icon
   */
  public notify(title: string | null | undefined, content?: string, type?: 'success' | 'info' | 'warning' | 'error', duration: number = 4000) {
    if (title == null) {
      console.trace('notify title is `undefined`!');
      title = 'Error!';
      content = 'Something went wrong!';
      type = 'error';
    }
    const nzDuration = duration <= 0 ? undefined : duration;
    return this.notificationService.create(type ?? 'blank', this.translate(title), this.translate(content ?? ''), { nzAnimate: true, nzDuration, nzClass: 'rounded-4 notify-' + this.getDirection(), nzPlacement: 'bottomRight', nzPauseOnHover: true })
  }

  public displayRoles(roles: Role[]) {
    return roles.map(v => this.translate(v === 'HeadOfDepartment' ? 'Head of Department' : v)).join(this.translate(', '));
  }

  public validation = {//used in FormControl validators
    strongPasswordValidator(control: FormControl): ValidationErrors | null {
      // implement password strength check
      const isValid = true;
      return isValid ? null : { strongPassword: true };
    },
    noWhitespaceValidator(control: FormControl) {
      const isValid = !(control.value || '').trim().includes(' ');
      return isValid ? null : { whitespace: true };
    },
    /**if control use maxlength or minlength validators then component should have {min/maxlength:number} obj. And this function should be called with translate pipe using param min/max obj. Ex: {{getRequireMaxMinErrMsg()|translate:minMaxLength}} */
    getRequireMaxMinLengthErrMsg(control: AbstractControl | null): string | '' {
      if (control?.hasError('required'))
        return 'You must enter a value';

      if (control?.hasError('maxlength'))
        return 'Maximum length is ';

      if (control?.hasError('minlength'))
        return 'Minimum length is ';

      return '';
    },
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

  /**
   * scroll user to the top.
   */
  public scrollTop() {
    window.scrollTo({ top: 0 })
  }

  /**@returns ex: `Third of 5 siblings (2 girls, 3 boys)` */
  displayFamilyInformation(child: IChildEntity) {
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

  public getDirection(): 'ltr' | 'rtl' {
    return this.currentLang.toLowerCase().includes('ar') ? 'rtl' : 'ltr';
  }

  /**User friendly to display a child's teachers name */
  displayTeachers(child: IChildEntity | undefined): string {
    if (Array.isArray(child?.teachers))
      return child!.teachers!.map(v => v.person.name).join(this.translate(', '))
    else return '';
  }

}

