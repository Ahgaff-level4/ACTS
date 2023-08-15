import { Component, ElementRef, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { NotificationService } from 'src/app/services/notification.service';
import { PasswordDialogComponent } from '../password-dialog/password-dialog.component';
import { PrivilegeService } from 'src/app/services/privilege.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormService } from 'src/app/services/form.service';
import { PersonService } from 'src/app/services/CRUD/person.service';
import { AccountService } from 'src/app/services/CRUD/account.service';
import { LoginService } from 'src/app/services/login.service';
import { User } from '../../../../../../interfaces';
import { UnsubOnDestroy } from 'src/app/unsub-on-destroy';

@Component({
  selector: 'app-edit-my-info',
  templateUrl: './edit-my-info.component.html',
  styleUrls: ['./edit-my-info.component.scss']
})
export class EditMyInfoComponent extends UnsubOnDestroy {
  public accountForm!: FormGroup;
  public personForm!: FormGroup;
  public phoneFields: string[] = [];
  public user!: User;
  /**image is the image file chosen by the user. If user dose not choose an image OR edit a person that has image, then it is `undefined`.
 * It will be defined only when user select an image as placeholder to submit the file
*/
  public image?: File;

  constructor(public dialogRef: MatDialogRef<any>, public nt: NotificationService,
    private pr: PrivilegeService, public formService: FormService, private fb: FormBuilder,
    private personService: PersonService, private accountService: AccountService,
    private loginService: LoginService) { super(); }

  ngOnInit() {
    this.sub.add(this.pr.user.subscribe(v => {
      if (v)
        this.user = v;
      else {
        this.nt.notify('You are not logged in! Please login then try again', undefined, 'error');
        this.dialogRef.close();
      }
    }));

    let maxPhone = -1;
    for (let i = 0; i < 10; i++)//show at least one empty phone field. Phone fields will show multiple fields if the account already has multiple phones
      if (this.user.phones[i])
        maxPhone = i;
    for (let j = 0; j <= maxPhone + 1 && j < 10; j++) {
      this.phoneFields.push('phone' + j)
    }

    const phoneValidators = [Validators.maxLength(15),
    Validators.minLength(9),
    Validators.pattern(/(^\+?)([0-9]+$)/)];

    this.accountForm = this.fb.group({
      username: [this.user.username ?? null, [Validators.required, this.formService.validation.noWhitespaceValidator, Validators.maxLength(32), Validators.minLength(4), this.formService.validation.unique]],
      address: [this.user.address || null, [Validators.maxLength(64)]],
      phone0: [this.user.phones[0] || null, phoneValidators],
      phone1: [this.user.phones[1] || null, phoneValidators],
      phone2: [this.user.phones[2] || null, phoneValidators],
      phone3: [this.user.phones[3] || null, phoneValidators],
      phone4: [this.user.phones[4] || null, phoneValidators],
      phone5: [this.user.phones[5] || null, phoneValidators],
      phone6: [this.user.phones[6] || null, phoneValidators],
      phone7: [this.user.phones[7] || null, phoneValidators],
      phone8: [this.user.phones[8] || null, phoneValidators],
      phone9: [this.user.phones[9] || null, phoneValidators],
    });

    this.personForm = this.fb.group({
      name: [this.user.person.name || null, [Validators.required, Validators.maxLength(100), Validators.minLength(4)]],
      birthDate: [this.user.person.birthDate || null,],
      gender: [this.user.person.gender || null, [Validators.required]],
      image: [this.user.person.image || null],
    });
  }

  changePassword() {
    this.nt.openDialog(PasswordDialogComponent);
  }

  async submit() {
    this.formService.trimFormGroup(this.personForm as FormGroup);
    this.formService.trimFormGroup(this.accountForm as FormGroup);
    this.personForm.markAllAsTouched();
    this.accountForm.markAllAsTouched();

    if (this.accountForm.valid) {
      this.accountForm.disable();
      const formData = new FormData();
      for (let c in this.personForm.value) {
        if (c != 'image' && this.personForm.controls[c].dirty)
          formData.append(c, this.personForm.controls[c].value);
      }
      if (this.image)
        formData.append('image', this.image);
      let isEmpty = true;
      formData.forEach(() => isEmpty = false);
      if (!isEmpty)
        await this.personService.patchPerson(this.user.person.id, formData).catch(() => { });
      let dirtyFields = this.formService.extractDirty(this.accountForm.controls);
      try {
        if (dirtyFields != null)
          await this.accountService.put(this.user.accountId, dirtyFields, true, false);
        this.nt.notify("Edited successfully", 'The account has been edited successfully', 'success');
        this.dialogRef.close();
      } catch (e) { }
      this.personForm.enable();
      this.accountForm.enable();
    } else {
      this.nt.notify('Invalid Field', 'There are invalid fields!', 'error');
      console.log(this.accountForm, this.personForm);
    }
    this.loginService.isLogin();
  }

  @ViewChild('imageRef2') imageRef!: ElementRef;
  onFileChange(event: Event) {
    // get the file object from the event target
    const file = (event.target as HTMLInputElement)?.files?.[0];
    if (!file)
      return;
    this.image = file;
    const reader = new FileReader();
    // read the file content as a data URL
    reader.readAsDataURL(file);
    // set the onload event handler
    reader.onload = () => {
      // assign the data URL to the imageURL variable
      this.imageRef.nativeElement.src = reader.result as string;
    };
  }

  getUsernameErrorMessage() {
    if (this.accountForm.getError('whitespace', 'username'))
      return 'Must not contain spaces';
    if (this.accountForm.getError('notUnique', 'username'))
      return 'The value entered is not unique';
    return this.formService.errMessage.requiredMinLengthMaxLength(this.accountForm.get('username')) || '';
  }

  getPhoneErrorMessage(controlName: string) {
    if (this.accountForm.getError('pattern', controlName))
      return "Phone number must contain only digits and '+' symbol";
    return this.formService.errMessage.requiredMinLengthMaxLength(this.accountForm.get(controlName));
  }

  onPhoneChange(index: number) {
    if (this.accountForm.get(`phone${index}`)?.value && this.phoneFields.length <= index + 1 && index < 10 - 1) {
      this.phoneFields.push(`phone${index + 1}`);
    }
  }
}
