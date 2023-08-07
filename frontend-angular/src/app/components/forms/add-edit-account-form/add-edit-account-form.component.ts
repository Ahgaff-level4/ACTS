import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { UnsubOnDestroy } from 'src/app/unsub-on-destroy';
import { PasswordDialogComponent } from '../../dialogs/password-dialog/password-dialog.component';
import { DisplayService } from 'src/app/services/display.service';
import { AccountService } from 'src/app/services/CRUD/account.service';
import { NotificationService } from 'src/app/services/notification.service';
import { FormService } from 'src/app/services/form.service';
import { PrivilegeService } from 'src/app/services/privilege.service';
import { IAccountEntity, ICreatePerson, IPersonEntity } from '../../../../../../interfaces';
import { PersonFormComponent } from '../person-form/person-form.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-edit-account-form[submitted][state]',
  templateUrl: './add-edit-account-form.component.html',
  styleUrls: ['./add-edit-account-form.component.scss']
})
export class AddEditAccountFormComponent extends UnsubOnDestroy implements OnInit {
  public accountForm!: FormGroup;
  public person?: IPersonEntity | ICreatePerson;
  public account: IAccountEntity | undefined;//account information to be edit or undefined for new child
  //used to navigate to accounts page if this component used in add-edit-account page.
  //OR used to close add-parent dialog if it used in add-edit-child page.
  @Output() submitted = new EventEmitter<IAccountEntity>();
  @Input() state!: 'add-edit-account' | 'add-parent';
  @Input() defaultPersonName = '';
  @ViewChild(PersonFormComponent) personForm?: PersonFormComponent;
  isLoading = false;
  hide = true;
  phoneFields: string[] = [];

  constructor(private fb: FormBuilder, private display: DisplayService, private accountService: AccountService,
    public formService: FormService, private nt: NotificationService,
    private pr: PrivilegeService, private router:Router,) {
    super();
  }

  ngOnInit(): void {
    if (history.state.data && history.state.data.username)//make sure it is account when editing; when edit-child and add-parent it conflicts with child object!
      this.account = history.state.data;

    let maxPhone = -1;
    for (let i = 0; i < 10; i++)//show at least one empty phone field. Phone fields will show multiple fields if the account already has multiple phones
      if (this.account?.['phone' + i])
        maxPhone = i;
    for (let j = 0; j <= maxPhone + 1 && j < 10; j++) {
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

    const phoneValidators = [Validators.maxLength(15),
    Validators.minLength(9),
    Validators.pattern(/(^\+?)([0-9]+$)/)];
    this.accountForm = this.fb.group({
      username: [this.account?.username ?? null, [Validators.required, this.formService.validation.noWhitespaceValidator, Validators.maxLength(32), Validators.minLength(4), this.formService.validation.unique]],
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
    if (this.state == 'add-parent') {
      this.accountForm.get('roles')?.setValue(['Parent']);
      this.accountForm.get('roles')?.disable();
    }
    this.sub.add(this.display.isLoading.subscribe(v => this.isLoading = v));
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
        this.display.isLoading.next(true);
        let person;
        if (this.state != 'add-parent')//not sensitive when adding parent account
          person = await this.accountService.sensitiveWrapper(() => this.personForm?.submit()).catch(() => { this.display.isLoading.next(false) });
        else person = await this.personForm.submit().catch(() => this.display.isLoading.next(false));
        this.display.isLoading.next(false);
        if (typeof person != 'object')
          return;
        try {
          const { repeatPassword, ...accountFields } = this.accountForm.value;//exclude repeatPassword property
          const newAccount = await this.accountService.post({ ...accountFields, personId: person.id }, true, this.state != 'add-parent');//include personId property
          newAccount.person = person;
          this.nt.notify("Added successfully", 'The new account has been registered successfully', 'success');
          this.submitted.emit(newAccount);
        } catch (e: any) {
          if (e?.error?.code === "ER_DUP_ENTRY")
            this.accountForm.get('username')?.setErrors({ notUnique: true });
          this.personForm.personService.deletePerson(person.id, true);//if creating an account run into some problem but person created successfully then just delete the person :>
        }
      } else {//edit the account
        this.display.isLoading.next(true);
        await this.accountService.sensitiveWrapper(() => this.personForm?.submitEdit()).catch(() => { this.display.isLoading.next(false) });
        this.display.isLoading.next(false);
        let dirtyFields = this.formService.extractDirty(this.accountForm.controls);
        try {
          if (dirtyFields != null)
            await this.accountService.put(this.account.id, dirtyFields, true);
          this.nt.notify("Edited successfully", 'The account has been edited successfully', 'success');
          this.router.navigate(['/accounts']);
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
    this.nt.openDialog<PasswordDialogComponent, string, string>(PasswordDialogComponent,
      this.accountForm.get('password')?.value || '').afterClosed()
      .subscribe(v => {
        if (typeof v === 'string') {
          this.accountForm.addControl('password', this.fb.control(v));
          this.accountForm.get('password')?.setValue(v);
          this.accountForm.get('password')?.markAsDirty()
        }
      })
  }


  getUsernameErrorMessage() {
    if (this.accountForm.getError('whitespace', 'username'))
      return 'Must not contain spaces';
    if (this.accountForm.getError('notUnique', 'username'))
      return 'The value entered is not unique';
    return this.formService.errMessage.requiredMinLengthMaxLength(this.accountForm.get('username')) || '';
  }


  getPasswordErrorMessage() {
    if (this.accountForm.getError('strongPassword', 'password'))
      return 'Password is not strong enough';

    return this.formService.errMessage.requiredMinLengthMaxLength(this.accountForm.get('password')) || '';
  }


  getRepeatPasswordErrorMessage() {
    if (this.accountForm.getError('passwordMatch', 'repeatPassword'))
      return 'Passwords do not match';

    return this.formService.errMessage.requiredMinLengthMaxLength(this.accountForm.get('repeatPassword')) || '';
  }


  getRolesErrorMessage() {
    if (this.accountForm.getError('require', 'roles') && this.accountForm.get('roles')?.touched)
      return 'You must choose a value';
    return '';
  }

  getPhoneErrorMessage(controlName: string) {
    if (this.accountForm.getError('pattern', controlName))
      return "Phone number must contain only digits and '+' symbol";
    return this.formService.errMessage.requiredMinLengthMaxLength(this.accountForm.get(controlName));
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
      content: `<p>${this.display.translate('There are four roles: Admin, Head of Department, Teacher, and Parent.')}<br>
    ${this.display.translate('Each role has different and shared privileges the following list describe each role privileges')}:</p>
    <ul>
      <li>${this.display.translate('Admin has all roles privileges and')}:
        <ol>
          ${this.pr.rolePrivileges('Admin')
          .filter(v => !this.pr.rolePrivileges('HeadOfDepartment').includes(v))
          .filter(v => !this.pr.rolePrivileges('Teacher').includes(v))
          .map(v => '<li>' + v + '</li>').join('\n')}
        </ol>
      </li>
      <li>${this.display.translate('Head of Department')}:
        <ol>
          ${this.pr.rolePrivileges('HeadOfDepartment').map(v => '<li>' + v + '</li>').join('\n')}
        </ol>
      </li>
      <li>${this.display.translate('Teacher')}:
        <ol>
          ${this.pr.rolePrivileges('Teacher').map(v => '<li>' + v + '</li>').join('\n')}
        </ol>
      </li>
      <li>${this.display.translate('Parent')}:
        <ol>
          ${this.pr.rolePrivileges('Parent').map(v => '<li>' + v + '</li>').join('\n')}
        </ol>
      </li>
    </ul>

    `, type: 'info', isXSS: false
    })
  }
}
