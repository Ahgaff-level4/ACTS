import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { IAccountEntity, ICreatePerson, IPersonEntity } from '../../../../../../../interfaces';
import { PersonFormComponent } from 'src/app/components/forms/person-form/person-form.component';
import { UtilityService } from 'src/app/services/utility.service';
import { AccountService } from 'src/app/services/account.service';

@Component({
  selector: 'app-add-edit-account',
  templateUrl: './add-edit-account.component.html',
  styleUrls: ['./add-edit-account.component.scss']
})
export class AddEditAccountComponent {
  public accountForm: FormGroup;
  public person?: IPersonEntity | ICreatePerson;
  public account: IAccountEntity | undefined;//account information to be edit or undefined for new child
  @ViewChild(PersonFormComponent) personForm?: PersonFormComponent;
  @ViewChild('submitButton') submitButton!: HTMLButtonElement;
  minMaxLength = { minlength: 4, maxlength: 32 };
  isLoading = false;

  constructor(private fb: FormBuilder, public ut: UtilityService, private accountService: AccountService) {
    this.accountForm = this.fb.group({
      username: [null, [Validators.required, this.noWhitespaceValidator, Validators.maxLength(32), Validators.minLength(4)]],
      password: [null, [Validators.required, this.strongPasswordValidator, Validators.minLength(4)]],
      repeatPassword: [null, [Validators.required, this.passwordMatchValidator, Validators.minLength(4)]],
      roles: [[], [this.rolesValidator]],
      address:[null,[Validators.maxLength(64)]]
    });
    this.account = history.state.data;
    this.person = this.account?.person;
    if (this.account) {
      this.accountForm?.setValue(this.ut.extractFrom(this.accountForm.controls, { ...this.account, password: '',repeatPassword:'' }));
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
          const { username, password, roles } = this.accountForm.value;
          await this.accountService.post({ username, password, roles, personId: p.id });
          this.ut.showSnackbar('The new account has been registered successfully.');
          this.ut.router.navigate(['/account']);
        } catch (e) {
          this.personForm.personService.deletePerson(p.id);//if creating an account run into some problem but person created successfully then just delete the person :>
        }
      } else {//edit the account
        await this.personForm.submitEdit();
        let dirtyFields = this.ut.extractDirty(this.accountForm.controls);
        if (dirtyFields != null)
          await this.accountService.patch(this.account.id, dirtyFields);
        this.ut.showSnackbar('The account has been edited successfully.');
        this.ut.router.navigate(['/account']);
      }
      this.accountForm?.enable();
      this.personForm?.formGroup?.enable();
      this.ut.isLoading.next(false);

    } else this.ut.showMsgDialog({ title: 'Invalid Field', type: 'error', content: 'There are invalid fields!' })
    // this.personForm.valid; do not submit if person field
  }

  private getRequireMaxMinLengthErrMsg(controlName: string): string | '' {
    if (this.accountForm.get(controlName)?.hasError('required'))
      return 'You must enter a value';

    if (this.accountForm.get(controlName)?.hasError('maxlength'))
      return 'Maximum length is ';

    if (this.accountForm.get(controlName)?.hasError('minlength'))
      return 'Minimum length is ';

    return '';
  }

  getUsernameErrorMessage() {
    if (this.accountForm.get('username')?.hasError('whitespace'))
      return 'Username must not contain spaces';

    return this.getRequireMaxMinLengthErrMsg('username') || '';
  }

  getPasswordErrorMessage() {
    if (this.accountForm.get('password')?.hasError('strongPassword'))
      return 'Password is not strong enough';

    return this.getRequireMaxMinLengthErrMsg('password') || '';
  }

  getRepeatPasswordErrorMessage() {
    if (this.accountForm.get('repeatPassword')?.hasError('passwordMatch'))
      return 'Passwords do not match';

    return this.getRequireMaxMinLengthErrMsg('repeatPassword') || '';
  }

  getRolesErrorMessage() {
    if (this.accountForm.get('roles')?.hasError('require') && this.accountForm.get('roles')?.touched)
      return 'You must choose a value';
    return '';
  }

  /**my Validator */
  noWhitespaceValidator(control: FormControl) {
    const isValid = !(control.value || '').trim().includes(' ');
    return isValid ? null : { whitespace: true };
  }

  /**my Validator */
  strongPasswordValidator(control: FormControl) {
    // implement password strength check
    const isValid = true;
    return isValid ? null : { strongPassword: true };
  }

  /**my Validator */
  passwordMatchValidator = (control: FormControl) => {
    const password = this.accountForm?.get('password')?.value;
    const repeatPassword = this.accountForm?.get('repeatPassword')?.value;
    return password === repeatPassword ? null : { passwordMatch: true };
  }

  rolesValidator(control: FormControl) {
    console.log(control.value);
    if (control.value.length == 0)
      return { require: true };
    return null;
  }
}
