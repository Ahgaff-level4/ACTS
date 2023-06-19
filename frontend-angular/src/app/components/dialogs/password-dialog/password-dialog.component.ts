import { Component, Inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AccountService } from 'src/app/services/CRUD/account.service';
import { FormService } from 'src/app/services/form.service';
import { NotificationService } from 'src/app/services/notification.service';
import { UtilityService } from 'src/app/services/utility.service';

@Component({
  selector: 'app-reset-change-password',
  templateUrl: './password-dialog.component.html',
  styleUrls: ['./password-dialog.component.scss']
})
export class PasswordDialogComponent {
  protected minlength = { minlength: 4 };
  public formGroup!: FormGroup;
  public hide = true;
  public hide1 = true;
  minMaxLength = { minlength: 4, maxlength: 32 };
  isReset!: boolean;
  /**
   * This component used to reset password, change password, and re-enter password.
   * Changing password require the old password.
   * While reset can be done only by the Admin.
   * To show the correspond fields for the right situation you should pass data when opening the dialog:
   * 1- data:string. To rest password either passing password typed before or empty string. dialog button 'Ok'. dialog return the entered password
   * 2- data:undefined. Change password will be handled here. dialog buttons 'Cancel' and 'Change' handed here. dialog return nothing aka undefined
   * 3- data:false. dialog buttons `Cancel` and `Confirm` will check the entered password. dialog return true if confirmed.
   */
  constructor(private fb:FormBuilder, public accountService: AccountService, private ut: UtilityService,
    public dialogRef: MatDialogRef<any>, @Inject(MAT_DIALOG_DATA) public data: string | undefined | false,
    private formService: FormService,private nt:NotificationService) {
  }

  ngOnInit(): void {
    this.formGroup = this.fb.group({
      oldPassword: [null, [Validators.required, Validators.minLength(4)]],
      password: [null, [Validators.required, this.formService.validation.strongPasswordValidator, Validators.minLength(4)]],
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
    if (this.formGroup.valid || (this.getState() == 'reset' && this.formGroup.get('password')?.valid && this.formGroup.get('repeatPassword')?.valid) || (this.getState() == 'reenter' && this.formGroup.get('password')?.valid)) {
      this.formGroup.disable();
      if (this.getState() == 'reset') {//reset
        this.dialogRef.close(this.formGroup.get('password')?.value?.toString());
      } else if (this.getState() == 'change') {//change
        if (this.formGroup.get('password')?.value == this.formGroup.get('oldPassword')?.value)
          this.nt.notify('Invalid Field', `The new password is the same old password!`, 'error');
        else {
          try {
            await this.accountService.changePassword({ oldPassword: this.formGroup.get('oldPassword')?.value, password: this.formGroup.get('password')?.value })
            this.nt.notify("Edited successfully", 'The password have been changed successfully', 'success');
            this.dialogRef.close();
          } catch (e) { }
        }
      } else {//re-enter
        this.ut.isLoading.next(true);
        this.accountService.reenter(this.formGroup.get('password')?.value)
          .subscribe({
            next: (u) => {
              this.ut.isLoading.next(false);
              if (u?.isLoggedIn)
                this.dialogRef.close(true);
              else this.nt.errorDefaultDialog();
            }, error: (err) => {
              this.ut.isLoading.next(false);
              this.nt.errorDefaultDialog(err);
            }
          });
      }
      this.formGroup.enable();
    } else
      this.nt.notify('Invalid Field', 'There are invalid fields!', 'error');

  }

  /**my Validator */
  passwordMatchValidator = (control: FormControl) => {
    const password = this.formGroup?.get('password')?.value;
    const repeatPassword = this.formGroup?.get('repeatPassword')?.value;
    return password === repeatPassword ? null : { passwordMatch: true };
  }

  getPasswordErrorMessage() {
    if (this.getState() != 'reenter' && this.formGroup.get('password')?.hasError('strongPassword'))
      return 'Password is not strong enough';

    return this.formService.validation.getRequireMaxMinLengthErrMsg(this.formGroup.get('password')) || '';
  }

  getRepeatPasswordErrorMessage() {
    if (this.formGroup.get('repeatPassword')?.hasError('passwordMatch'))
      return 'Passwords do not match';

    return this.formService.validation.getRequireMaxMinLengthErrMsg(this.formGroup.get('repeatPassword')) || '';
  }

  getOldPasswordErrorMessage() {
    return this.formService.validation.getRequireMaxMinLengthErrMsg(this.formGroup.get('oldPassword'));
  }

  /** dialog state which is what the dialog purpose */
  getState(): 'reset' | 'change' | 'reenter' {
    if (this.data === false)
      return 'reenter';
    return typeof this.data === 'string' ? 'reset' : 'change';
  }

  getTitle(): string {
    if (this.getState() === 'change')
      return 'Change password';
    if (this.getState() === 'reset')
      return 'Reset password';
    return 'Re-enter password'
  }

}
