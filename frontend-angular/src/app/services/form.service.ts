import { Injectable } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors } from '@angular/forms';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class FormService {

  constructor() { }

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
}
