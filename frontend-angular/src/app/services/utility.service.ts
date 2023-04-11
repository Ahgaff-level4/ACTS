import { HttpClient, HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Role, SuccessResponse, User, ErrorResponse } from './../../../../interfaces.d';
import { BehaviorSubject } from 'rxjs';
import { environment as env } from 'src/environment';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MessageDialogComponent, MessageDialogData } from '../components/dialogs/message/message.component';
import * as moment from 'moment';
import { AbstractControl, FormControl, FormGroup, ValidatorFn } from '@angular/forms';
import { Router } from '@angular/router';
@Injectable({
  providedIn: 'root'
})
export class UtilityService {

  public user: BehaviorSubject<User | null> = new BehaviorSubject<User | null>(null);//null means not loggedIn and there is no user info
  public ordinalNumbers = ['First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth', 'Seventh', 'Eighth', 'Ninth', 'Tenth', 'Eleventh', 'Twelfth', 'Thirteenth', 'Fourteenth', 'Fifteenth', 'Sixteenth', 'Seventeenth', 'Eighteenth', 'Nineteenth', 'Twentieth', 'Twenty-first', 'Twenty-second', 'Twenty-third', 'Twenty-fourth', 'Twenty-fifth', 'Twenty-sixth', 'Twenty-seventh', 'Twenty-eighth', 'Twenty-ninth', 'Thirtieth'];

  constructor(private http: HttpClient, private translatePipe: TranslatePipe, private dialog: MatDialog, public router: Router) {
    // this.user.next({ isLoggedIn: true, accountId: 8, roles: ['Admin'], name: 'Khaled' });//todo delete this. Used to show app as user logged in


  }

  /**
   * promise will be fulfilled and user.next(...) will be called if user is login. otherwise rejected.
   */
  public isLogin = () => {
    return new Promise<void>((resolve, rej) => {
      this.http.get<User>(env.AUTH + 'isLogin', { withCredentials: true }).subscribe({
        next: res => {
          if (typeof res.accountId === 'number' && typeof res.isLoggedIn === 'boolean' && Array.isArray(res.roles)) {
            this.user.next(res);
            resolve()
          }
          else rej();
        }, error: rej
      });
    })
  }


  /**
   * Display error dialog with message of:
   * - if HttpErrorResponse then extract the message.
   * - if string then message is eOrMessage.
   * - else show default message (e.g., 'Something Went Wrong!').
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
      message = this.translatePipe.transform('Something went wrong!') + (appendMsg ? ' ' + this.translatePipe.transform(appendMsg) : '');

    return this.showMsgDialog({ content: message, type: 'error' })
  }

  /**
   * We recommend using pipe translate (e.g., `<h1>{{title | translate}}</h1>`)
   * @param key key inside the ar.json file.
   * @returns correspond value of the provided key translation (e.g., 'Login' or 'تسجيل دخول')
   */
  public translate(key: string, ...args: any[]): string {
    return this.translatePipe.transform(key, args);
  }

  public showMsgDialog(data: MessageDialogData) {
    return this.dialog
      .open<MessageDialogComponent, MessageDialogData>(MessageDialogComponent, { data });
  }

  /**
   * @return `true` if user's roles has any one role of the param `roles`. If user han no role overlap with param `roles` then return `false`
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
    for (let k in keys) {
      ret[k] = properties[k];
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
      if (controls[key].dirty)
        ret[key] = controls[key].value;

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
        if (control)
          control.setValue(control.value.trim());
      });
  }
}

