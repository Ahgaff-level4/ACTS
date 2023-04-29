import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { IAccountEntity, ICreatePerson, IPersonEntity } from '../../../../../../../interfaces';
import { PersonFormComponent } from 'src/app/components/forms/person-form/person-form.component';
import { UtilityService } from 'src/app/services/utility.service';
import { AccountService } from 'src/app/services/account.service';
import { MatDialog } from '@angular/material/dialog';
import { ResetChangePasswordComponent } from 'src/app/components/dialogs/reset-change-password/reset-change-password.component';

@Component({
  selector: 'app-add-edit-account',
  templateUrl: './add-edit-account.component.html',
  styleUrls: ['./add-edit-account.component.scss']
})
export class AddEditAccountComponent implements OnInit{
  public accountForm!: FormGroup;
  public person?: IPersonEntity | ICreatePerson;
  public account: IAccountEntity | undefined;//account information to be edit or undefined for new child
  @ViewChild(PersonFormComponent) personForm?: PersonFormComponent;
  @ViewChild('submitButton') submitButton!: HTMLButtonElement;
  minMaxLength = { minlength: 4, maxlength: 32 };
  phoneMaxLength = { maxlength: 15 }
  isLoading = false;
  hide = true;
  phoneFields = ['phone0'];


  constructor(private fb: FormBuilder, public ut: UtilityService, private accountService: AccountService, private dialog: MatDialog) {
  }

  ngOnInit(): void {
    this.account = history.state.data;
    this.person = this.account?.person;
    let pass = this.account?.id ? {} : {
      password: [null, [Validators.required, this.ut.validation.strongPasswordValidator, Validators.minLength(4)]],
      repeatPassword: [null, [Validators.required, this.passwordMatchValidator, Validators.minLength(4)]],
    };

    this.accountForm = this.fb.group({
      username: [null, [Validators.required, this.ut.validation.noWhitespaceValidator, Validators.maxLength(32), Validators.minLength(4)]],
      ...pass,
      roles: [[], [this.rolesValidator]],
      address: [null, [Validators.maxLength(64)]],
    });
    for (let i = 0; i < 10; i++)
      this.accountForm.addControl('phone' + i, this.fb.control(null, [Validators.maxLength(15), Validators.pattern(/^\+?\d+$/)]));

    if (this.account) {
      this.account.address = this.account.address ?? undefined;//the field should be as a key property in the account object even if it has value of undefined
      for (let i = 0; i < 10; i++)
        this.account['phone' + i] = this.account['phone' + i] ?? undefined;
      this.accountForm?.setValue(this.ut.extractFrom(this.accountForm.controls, { ...this.account, password: '', repeatPassword: '' }));
    }

    this.ut.isLoading.subscribe(v => this.isLoading = v);
  }

  async submit() {
    this.ut.trimFormGroup(this.personForm?.formGroup as FormGroup);
    this.ut.trimFormGroup(this.accountForm);
    this.personForm?.formGroup?.markAllAsTouched();
    this.accountForm?.markAllAsTouched();

    if (this.personForm?.formGroup?.valid && this.accountForm?.valid) {
      this.accountForm?.disable();
      this.personForm?.formGroup?.disable();
      this.ut.isLoading.next(true);
      if (this.account?.id == null) {//Register new account
        let p: IPersonEntity = await this.personForm.submit();
        try {
          const { repeatPassword, ...accountFields } = this.accountForm.value;//exclude repeatPassword property
          await this.accountService.post({ ...accountFields, personId: p.id });//include personId property
          this.ut.showSnackbar('The new account has been registered successfully.');
          this.ut.router.navigate(['/account']);
        } catch (e) {
          this.personForm.personService.deletePerson(p.id);//if creating an account run into some problem but person created successfully then just delete the person :>
        }
      } else {//edit the account
        await this.personForm.submitEdit();
        let dirtyFields = this.ut.extractDirty(this.accountForm.controls);
        if (dirtyFields != null)
          await this.accountService.put(this.account.id, dirtyFields);
        this.ut.showSnackbar('The account has been edited successfully.');
        this.ut.router.navigate(['/account']);
      }
      this.accountForm?.enable();
      this.personForm?.formGroup?.enable();
      this.ut.isLoading.next(false);

    } else this.ut.showMsgDialog({ title: {text:'Invalid Field'}, type: 'error', content: 'There are invalid fields!' })
  }


  resetPassword() {
    this.accountForm.get('password')?.disable();
    this.dialog.open<ResetChangePasswordComponent, string, string>(ResetChangePasswordComponent,
      { data: this.accountForm.get('password')?.value || '' }).afterClosed()
      .subscribe(v => {
        console.log('after close', v)
        if (typeof v === 'string') {
          this.accountForm.addControl('password', this.fb.control(v));
          this.accountForm.get('password')?.setValue(v);
          this.accountForm.get('password')?.markAsDirty()
        }
      })
  }


  getUsernameErrorMessage() {
    if (this.accountForm.get('username')?.hasError('whitespace'))
      return 'Must not contain spaces';

    return this.ut.validation.getRequireMaxMinLengthErrMsg(this.accountForm.get('username')) || '';
  }


  getPasswordErrorMessage() {
    if (this.accountForm.get('password')?.hasError('strongPassword'))
      return 'Password is not strong enough';

    return this.ut.validation.getRequireMaxMinLengthErrMsg(this.accountForm.get('password')) || '';
  }


  getRepeatPasswordErrorMessage() {
    if (this.accountForm.get('repeatPassword')?.hasError('passwordMatch'))
      return 'Passwords do not match';

    return this.ut.validation.getRequireMaxMinLengthErrMsg(this.accountForm.get('repeatPassword')) || '';
  }


  getRolesErrorMessage() {
    if (this.accountForm.get('roles')?.hasError('require') && this.accountForm.get('roles')?.touched)
      return 'You must choose a value';
    return '';
  }

  getPhoneErrorMessage(controlName: string) {
    if (this.accountForm.get(controlName)?.hasError('pattern'))
      return "Phone number must contain only digits and '+' symbol";
    return this.ut.validation.getRequireMaxMinLengthErrMsg(this.accountForm.get(controlName)) || '';
  }



  /**my Validator */
  passwordMatchValidator = (control: FormControl) => {
    const password = this.accountForm?.get('password')?.value;
    const repeatPassword = this.accountForm?.get('repeatPassword')?.value;
    return password === repeatPassword ? null : { passwordMatch: true };
  }


  rolesValidator(control: FormControl) {
    if (control.value.length == 0)
      return { require: true };
    return null;
  }


  onPhoneChange(index: number) {
    if (this.accountForm.get(`phone${index}`)?.value && this.phoneFields.length <= index + 1 && index < 10 - 1) {
      this.phoneFields.push(`phone${index + 1}`);
    }
  }
}
