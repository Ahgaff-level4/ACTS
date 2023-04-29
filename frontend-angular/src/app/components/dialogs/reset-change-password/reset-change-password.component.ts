import { Component, Inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AccountService } from 'src/app/services/account.service';
import { UtilityService } from 'src/app/services/utility.service';

@Component({
  selector: 'app-reset-change-password',
  templateUrl: './reset-change-password.component.html',
  styleUrls: ['./reset-change-password.component.scss']
})
export class ResetChangePasswordComponent {
  protected minlength = { minlength: 4 };
  public formGroup!: FormGroup;
  public hide = true;
  public hide1 = true;
  minMaxLength = { minlength: 4, maxlength: 32 };
  isReset!: boolean;
  /**
   * This component used to reset password or change password.
   * Changing password require the old password.
   * While reset can be done only by the Admin.
   * To show the correspond fields for the right situation you should pass data when opening the dialog:
   * 1- data:string. To rest password either passing password typed before or empty string. dialog button 'Ok'. dialog return the entered password
   * 2- data:undefined. Change password will be handled here. dialog buttons 'Cancel' and 'Change' handed here. dialog return nothing aka undefined
   */
  constructor(private fb: FormBuilder, public accountService: AccountService, private ut: UtilityService, public dialogRef: MatDialogRef<any>, @Inject(MAT_DIALOG_DATA) public data:string|undefined,) {
  }

  ngOnInit(): void {
    this.formGroup = this.fb.group({
      oldPassword: [null, [Validators.required, Validators.minLength(4)]],
      password: [null, [Validators.required, this.ut.validation.strongPasswordValidator, Validators.minLength(4)]],
      repeatPassword: [null, [Validators.required, this.passwordMatchValidator, Validators.minLength(4)]],
    });
    this.isReset = typeof this.data === 'string';
    if (typeof this.data === 'string') {//Reset password
      this.formGroup.get('password')?.setValue(this.data);
      this.formGroup.get('repeatPassword')?.setValue(this.data);
    }
  }


  public async submit(e: SubmitEvent) {
    e.preventDefault();
    this.formGroup.markAllAsTouched();
    if (this.formGroup.valid || (this.isReset && this.formGroup.get('password')?.valid && this.formGroup.get('repeatPassword')?.valid)) {
      this.formGroup.disable();
      if (typeof this.data === 'string') {//reset
        this.dialogRef.close(this.formGroup.get('password')?.value?.toString());
        console.log('reset password',this.formGroup.get('password')?.value?.toString())
      } else {//change
        //todo communicate with server to change password. Change snackbar message
        this.ut.showSnackbar('The field has been edited successfully.');
        this.dialogRef.close();
      }
      this.formGroup.enable();
    } else
      this.ut.showMsgDialog({ title: {text:'Invalid Field'}, type: 'error', content: 'There are invalid fields!' });

  }

  /**my Validator */
  passwordMatchValidator = (control: FormControl) => {
    const password = this.formGroup?.get('password')?.value;
    const repeatPassword = this.formGroup?.get('repeatPassword')?.value;
    return password === repeatPassword ? null : { passwordMatch: true };
  }

  getPasswordErrorMessage() {
    if (this.formGroup.get('password')?.hasError('strongPassword'))
      return 'Password is not strong enough';

    return this.ut.validation.getRequireMaxMinLengthErrMsg(this.formGroup.get('password')) || '';
  }

  getRepeatPasswordErrorMessage() {
    if (this.formGroup.get('repeatPassword')?.hasError('passwordMatch'))
      return 'Passwords do not match';

    return this.ut.validation.getRequireMaxMinLengthErrMsg(this.formGroup.get('repeatPassword')) || '';
  }

  getOldPasswordErrorMessage() {
    return this.ut.validation.getRequireMaxMinLengthErrMsg(this.formGroup.get('oldPassword'));
  }



}
