import { HttpClient, HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Role, SuccessResponse, User, ErrorResponse } from './../../../../interfaces.d';
import { BehaviorSubject } from 'rxjs';
import { environment as env } from 'src/environment';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { MessageDialogComponent, MessageDialogData } from '../components/dialogs/message/message.component';
import * as moment from 'moment';
import { AbstractControl, FormControl, ValidatorFn } from '@angular/forms';
import { Router } from '@angular/router';
@Injectable({
  providedIn: 'root'
})
export class UtilityService {
  constructor(private http: HttpClient, private translatePipe: TranslatePipe, private dialog: MatDialog, public router: Router) {
    this.user.next({ isLoggedIn: true, accountId: 8, roles: ['Admin'], name: 'Khaled' });//todo delete this. Used to show app as user logged in

    var isRememberMe: 'true' | 'false' = localStorage.getItem('isRememberMe') as 'true' | 'false';
    if (isRememberMe === 'true' && this.user.value === null)
      this.isLogin();
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

  public user: BehaviorSubject<User | null> = new BehaviorSubject<User | null>(null);//null means not loggedIn and there is no user info

  /**
   * Display error dialog with message of:
   * - if HttpErrorResponse then extract the message.
   * - if string then message is eOrMessage.
   * - else show default message (e.g., 'Something Went Wrong!').
   * @param eOrMessage
   * @param appendMsg used when error could not be identified and will be appended after the default error message: `'Something Went Wrong! '+appendMsg`
   */
  public errorDefaultDialog = (eOrMessage?: HttpErrorResponse | string | ErrorResponse | SuccessResponse,appendMsg?:string): void => {
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
      message = this.translatePipe.transform('Something went wrong!')+' '+this.translatePipe.transform(appendMsg??'');

    this.showMsgDialog({ content: message, type: 'error' })
  }

  /**
   * We recommend using pipe translate (e.g., `<h1>{{title | translate}}</h1>`)
   * @param key key inside the ar.json file.
   * @returns correspond value of the provided key translation (e.g., 'Login' or 'تسجيل دخول')
   */
  public translate(key: string): string {
      return this.translatePipe.transform(key);
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
}

