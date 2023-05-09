import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Role, SuccessResponse, User, ErrorResponse } from './../../../../interfaces.d';
import { BehaviorSubject } from 'rxjs';
import { environment as env } from 'src/environments/environment';
import { TranslatePipe } from '@ngx-translate/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ButtonType, MessageDialogComponent, MessageDialogData } from '../components/dialogs/message/message.component';
import * as moment from 'moment';
import { AbstractControl, FormControl, FormGroup, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
@Injectable({
  providedIn: 'root'
})
export class UtilityService {

  public user: BehaviorSubject<User | null> = new BehaviorSubject<User | null>(null);//null means not loggedIn and there is no user info
  public ordinalNumbers = ['First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth', 'Seventh', 'Eighth', 'Ninth', 'Tenth', 'Eleventh', 'Twelfth', 'Thirteenth', 'Fourteenth', 'Fifteenth', 'Sixteenth', 'Seventeenth', 'Eighteenth', 'Nineteenth', 'Twentieth', 'Twenty-first', 'Twenty-second', 'Twenty-third', 'Twenty-fourth', 'Twenty-fifth', 'Twenty-sixth', 'Twenty-seventh', 'Twenty-eighth', 'Twenty-ninth', 'Thirtieth'];
  public isLoading = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient, private translatePipe: TranslatePipe, private dialog: MatDialog, public router: Router, private snackbar: MatSnackBar) {
    // this.user.next({ isLoggedIn: true, accountId: 8, roles: ['Admin'], name: 'Khaled' });//todo delete this. Used to show app as user logged in
  }


  /**
   * promise will be fulfilled and user.next(...) will be called if user is login. otherwise rejected.
   */
  public isLogin = () => {
    return new Promise<void>((resolve, rej) => {
      this.http.get<User>(env.AUTH + 'isLogin').subscribe({
        next: res => {
          if (typeof res.accountId === 'number' && Array.isArray(res.roles)) {
            this.user.next(res);
            resolve();
          }
          else {
            this.user.next(null);
            rej();
          }
        }, error: () => {
          this.user.next(null);
          rej();
        }
      });
    })
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
   * @param key key inside the ar.json file.
   * @returns correspond value of the provided key translation (e.g., 'Login' or 'تسجيل دخول')
   */
  public translate(key: string, ...args: any[]): string {
    return this.translatePipe.transform(key, args);
  }

  /**
   *
   * @param data structure of the message dialog
   * @returns MatDialogRef. Value when close is the button type clicked.
   */
  public showMsgDialog(data: MessageDialogData) {
    return this.dialog
      .open<MessageDialogComponent, MessageDialogData, ButtonType>(MessageDialogComponent, { data });
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
   *
   * @param message text
   * @param action text of the action button like `Undo` or `Ok`.
   * @param duration before the snackbar automatically dismissed. Value is in milliseconds.
   * @returns on action clicked observable.
   */
  public showSnackbar(message: string, action?: string, duration = 4000) {
    message = this.translate(message);
    return this.snackbar.open(message, action, { duration }).onAction()
  }

  /**calculate the age of birthdate object from now
   * @returns age in decimal. ex: 3.141
   */
  public calcAge(birthdate: Date | string) {
    birthdate = new Date(birthdate);
    const today = new Date();
    const ageInDays = (today.getTime() - birthdate.getTime()) / (1000 * 60 * 60 * 24);
    const ageInYears = ageInDays / 365.25;
    return ageInYears;
  }

  public displayRoles(roles: Role[]) {
    return roles.map(v => this.translate(v === 'HeadOfDepartment' ? 'Head of Department' : v)).join(this.translate(',') + ' ');
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
    }
  }

}

