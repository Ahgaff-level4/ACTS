import { AfterViewInit, Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { IAccountEntity, ICreatePerson, IPersonEntity } from '../../../../../../../interfaces';
import { PersonFormComponent } from 'src/app/components/forms/person-form/person-form.component';
import { UtilityService } from 'src/app/services/utility.service';
import { AccountService } from 'src/app/services/CRUD/account.service';
import { MatDialog } from '@angular/material/dialog';
import { PasswordDialogComponent } from 'src/app/components/dialogs/password-dialog/password-dialog.component';
import { UnsubOnDestroy } from 'src/app/unsub-on-destroy';
import { FormService } from 'src/app/services/form.service';
import { NotificationService } from 'src/app/services/notification.service';
import { PrivilegeService } from 'src/app/services/privilege.service';

@Component({
  selector: 'app-add-edit-account',
  templateUrl: './add-edit-account.component.html',
  styleUrls: ['./add-edit-account.component.scss']
})
export class AddEditAccountComponent extends UnsubOnDestroy implements OnInit, AfterViewInit {
  public accountForm!: FormGroup;
  public person?: IPersonEntity | ICreatePerson;
  public account: IAccountEntity | undefined;//account information to be edit or undefined for new child
  @ViewChild(PersonFormComponent) personForm?: PersonFormComponent;
  @ViewChild('submitButton') submitButton!: HTMLButtonElement;
  minMaxLength = { minlength: 4, maxlength: 32 };
  phoneMinMaxLength = { maxlength: 15, minlength: 9 }
  isLoading = false;
  hide = true;
  phoneFields: string[] = [];
  @Input('account') readonlyAccount: IAccountEntity | undefined;//was used in account table to show account info


  constructor(private fb: FormBuilder, public ut: UtilityService, private accountService: AccountService,
    private dialog: MatDialog, public formService: FormService, private nt: NotificationService,
    private pr: PrivilegeService) {
    super();
  }

  ngOnInit(): void {
    if (this.readonlyAccount)
      this.account = this.readonlyAccount;
    else
      this.account = history.state.data;

    let maxPhone = -1;
    for (let i = 0; i < 10; i++)//show at least one empty phone field. Phone fields will show multiple fields if the account already has multiple phones
      if (this.account?.['phone' + i])
        maxPhone = i;
    for (let j = 0; j <= maxPhone + 1; j++) {
      this.phoneFields.push('phone' + j)
    }

    this.person = this.account?.person;
    let pass = this.account?.id ? {} : {
      password: [null, [Validators.required, this.formService.validation.strongPasswordValidator, Validators.minLength(4)]],
      repeatPassword: [null, [Validators.required, this.passwordMatchValidator, Validators.minLength(4)]],
    };

    if (this.account) {
      this.account.address = this.account.address ?? undefined;//the field should be as a key property in the account object even if it has value of undefined
      for (let i = 0; i < 10; i++)
        this.account['phone' + i] = this.account['phone' + i] ?? undefined;
    }

    const phoneValidators = [Validators.maxLength(this.phoneMinMaxLength.maxlength),
    Validators.minLength(this.phoneMinMaxLength.minlength),
    Validators.pattern(/(^\+?)([0-9]+$)/)];
    this.accountForm = this.fb.group({
      username: [this.account?.username ?? null, [Validators.required, this.formService.validation.noWhitespaceValidator, Validators.maxLength(32), Validators.minLength(4)]],
      ...pass,
      roles: [this.account?.roles ?? [], [this.rolesValidator]],
      address: [this.account?.address ?? null, [Validators.maxLength(64)]],
      phone0: [this.account?.phone0 ?? null, phoneValidators],
      phone1: [this.account?.phone1 ?? null, phoneValidators],
      phone2: [this.account?.phone2 ?? null, phoneValidators],
      phone3: [this.account?.phone3 ?? null, phoneValidators],
      phone4: [this.account?.phone4 ?? null, phoneValidators],
      phone5: [this.account?.phone5 ?? null, phoneValidators],
      phone6: [this.account?.phone6 ?? null, phoneValidators],
      phone7: [this.account?.phone7 ?? null, phoneValidators],
      phone8: [this.account?.phone8 ?? null, phoneValidators],
      phone9: [this.account?.phone9 ?? null, phoneValidators],
    });

    this.sub.add(this.ut.isLoading.subscribe(v => this.isLoading = v));
  }

  ngAfterViewInit(): void {
    if (this.readonlyAccount && this.personForm) {
      this.accountForm.disable();
      this.personForm.formGroup.disable();
      this.accountForm.setValue(this.formService.extractFrom(this.accountForm.controls, this.readonlyAccount));
      this.personForm.formGroup.setValue(this.formService.extractFrom(this.personForm.formGroup.controls, this.readonlyAccount.person))
    }
  }

  async submit() {
    this.formService.trimFormGroup(this.personForm?.formGroup as FormGroup);
    this.formService.trimFormGroup(this.accountForm);
    this.personForm?.formGroup?.markAllAsTouched();
    this.accountForm?.markAllAsTouched();

    if (this.personForm?.formGroup?.valid && this.accountForm?.valid) {
      this.accountForm?.disable();
      this.personForm?.formGroup?.disable();
      if (this.account?.id == null) {//Register new account
        // this.ut.isLoading.next(true);
        // let person = await this.personForm.submit().catch(() => { this.ut.isLoading.next(false) });
        // this.ut.isLoading.next(false);
        // if (typeof person != 'object')
          // return;
        try {
          const { repeatPassword, ...accountFields } = this.accountForm.value;//exclude repeatPassword property
          await this.accountService.post({ ...accountFields, person:this.personForm.getCreatePerson() }, true);//include personId property
          this.nt.notify("Added successfully", 'The new account has been registered successfully', 'success');
          this.ut.router.navigate(['/account']);
        } catch (e) {
          // this.personForm.personService.deletePerson(person.id);//if creating an account run into some problem but person created successfully then just delete the person :>
        }
      } else {//edit the account
        this.ut.isLoading.next(true);
        await this.personForm.submitEdit().catch(() => { this.ut.isLoading.next(false) });
        this.ut.isLoading.next(false);
        let dirtyFields = this.formService.extractDirty(this.accountForm.controls);
        try {
          if (dirtyFields != null)
            await this.accountService.put(this.account.id, dirtyFields, true);
          this.nt.notify("Edited successfully", 'The account has been edited successfully', 'success');
          this.ut.router.navigate(['/account']);
        } catch (e) { }
      }
      this.accountForm?.enable();
      this.personForm?.formGroup?.enable();
    } else {
      this.nt.notify('Invalid Field', 'There are invalid fields!', 'error');
      console.log(this.accountForm, this.personForm);
    }
  }


  resetPassword() {
    this.accountForm.get('password')?.disable();
    this.dialog.open<PasswordDialogComponent, string, string>(PasswordDialogComponent,
      { data: this.accountForm.get('password')?.value || '', direction: this.ut.getDirection() }).afterClosed()
      .subscribe(v => {
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

    return this.formService.validation.getRequireMaxMinLengthErrMsg(this.accountForm.get('username')) || '';
  }


  getPasswordErrorMessage() {
    if (this.accountForm.get('password')?.hasError('strongPassword'))
      return 'Password is not strong enough';

    return this.formService.validation.getRequireMaxMinLengthErrMsg(this.accountForm.get('password')) || '';
  }


  getRepeatPasswordErrorMessage() {
    if (this.accountForm.get('repeatPassword')?.hasError('passwordMatch'))
      return 'Passwords do not match';

    return this.formService.validation.getRequireMaxMinLengthErrMsg(this.accountForm.get('repeatPassword')) || '';
  }


  getRolesErrorMessage() {
    if (this.accountForm.get('roles')?.hasError('require') && this.accountForm.get('roles')?.touched)
      return 'You must choose a value';
    return '';
  }

  getPhoneErrorMessage(controlName: string) {
    if (this.accountForm.get(controlName)?.hasError('pattern'))
      return "Phone number must contain only digits and '+' symbol";
    return this.formService.validation.getRequireMaxMinLengthErrMsg(this.accountForm.get(controlName)) || '';
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

  showRolesInfo() {
    this.nt.showMsgDialog({
      title: { text: 'Roles information' },
      content: `<p>${this.ut.translate('There are four roles: Admin, Head of Department, Teacher, and Parent.')}<br>
    ${this.ut.translate('Each role has different and shared privileges the following list describe each role privileges')}:</p>
    <ul>
      <li>${this.ut.translate('Admin has all roles privileges and')}:
        <ol>
          ${this.pr.rolePrivileges('Admin')
          .filter(v=>!this.pr.rolePrivileges('HeadOfDepartment').includes(v))
          .filter(v=>!this.pr.rolePrivileges('Teacher').includes(v))
          .map(v => '<li>' + v + '</li>').join('\n')}
        </ol>
      </li>
      <li>${this.ut.translate('Head of Department')}:
        <ol>
          ${this.pr.rolePrivileges('HeadOfDepartment').map(v => '<li>' + v + '</li>').join('\n')}
        </ol>
      </li>
      <li>${this.ut.translate('Teacher')}:
        <ol>
          ${this.pr.rolePrivileges('Teacher').map(v => '<li>' + v + '</li>').join('\n')}
        </ol>
      </li>
      <li>${this.ut.translate('Parent')}:
        <ol>
          ${this.pr.rolePrivileges('Parent').map(v => '<li>' + v + '</li>').join('\n')}
        </ol>
      </li>
    </ul>

    `, type: 'info', isXSS: false
    })
  }




}
