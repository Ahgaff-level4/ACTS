import { Injectable } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors } from '@angular/forms';
import * as moment from 'moment';
import { DisplayService } from 'src/app/services/display.service';
import { Observable, takeWhile } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FormService {
  public nowDate$: Observable<Date> = new Observable(subscriber => subscriber.next(new Date()));
  public before80y$: Observable<Date> = new Observable(subscriber => subscriber.next(new Date(new Date().getFullYear() - 80, new Date().getMonth(), new Date().getDate())));
  public before20y$: Observable<Date> = new Observable(subscriber => subscriber.next(new Date(new Date().getFullYear() - 20, new Date().getMonth(), new Date().getDate())));
  public minCreatedDate$: Observable<Date> = new Observable(subscriber => subscriber.next(new Date(new Date().getFullYear() - 5, new Date().getMonth(), new Date().getDate())));

  constructor(private display: DisplayService, private http: HttpClient) { }
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

  /**used in FormControl validators*/
  public validation = {
    strongPasswordValidator(control: FormControl): ValidationErrors | null {
      //todo implement password strength check
      const isValid = true;
      return isValid ? null : { strongPassword: true };
    },
    noWhitespaceValidator(control: FormControl) {
      const isValid = !(control.value || '').trim().includes(' ');
      return isValid ? null : { whitespace: true };
    },
    unique(control: FormControl): ValidationErrors | null {
      if (control.getError('notUnique')) {
        const oldValue = control.getRawValue();
        control.valueChanges.pipe(takeWhile(v => {
          if (control.getRawValue() == oldValue)
            return true;
          control.setErrors(null);
          return false;
        })).subscribe(() => { });
        return { notUnique: true };
      }

      return null;
    }

  }

  public errMessage = {
    /**if control use maxlength or minlength validators then component should have {min/maxlength:number} obj. And this function should be called with translate pipe using param min/max obj. Ex: {{getRequireMaxMinErrMsg()|translate:minMaxLength}} */
    requiredMinLengthMaxLength: (control: AbstractControl | null): string => {
      if (control?.hasError('required'))
        return 'You must enter a value';

      if (control?.hasError('maxlength'))
        return this.display.translate('Maximum length is ') + control.getError('maxlength').requiredLength;

      if (control?.hasError('minlength'))
        return this.display.translate('Minimum length is ') + control.getError('minlength').requiredLength;

      return '';
    },
  }

  public fetchPersonsByName(name: string, personState: 'child' | 'account'): Observable<{ name: string, id: number }[]> {
    return this.http.get<{ name: string, id: number }[]>(environment.API + 'person/names',
      { params: { name, personState } });
  }
}
