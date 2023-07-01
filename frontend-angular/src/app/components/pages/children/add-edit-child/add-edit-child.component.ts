import { AfterViewChecked, AfterViewInit, Component, Input, OnDestroy, OnInit, ViewChild, HostListener } from '@angular/core';
import { IAccountEntity, IChildEntity, ICreatePerson, IPersonEntity } from '../../../../../../../interfaces';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UtilityService } from 'src/app/services/utility.service';
import { ChildService } from 'src/app/services/CRUD/child.service';
import { PersonFormComponent } from 'src/app/components/forms/person-form/person-form.component';
import { Observable, Subscription } from 'rxjs';
import { AccountService } from 'src/app/services/CRUD/account.service';
import { ComponentCanDeactivate } from 'src/app/app-routing.module';
import { UnsubOnDestroy } from 'src/app/unsub-on-destroy';
import { FormService } from 'src/app/services/form.service';
import { NotificationService } from 'src/app/services/notification.service';

@Component({
  selector: 'app-add-edit-child',
  templateUrl: './add-edit-child.component.html',
  styleUrls: ['./add-edit-child.component.scss']
})
export class AddEditChildComponent extends UnsubOnDestroy implements OnInit, OnDestroy {
  public childForm!: FormGroup;
  public person?: IPersonEntity | ICreatePerson;
  public child: IChildEntity | undefined;//child information to be edit or undefined for new child
  @ViewChild(PersonFormComponent) personForm?: PersonFormComponent;
  @ViewChild('submitButton') submitButton!: HTMLButtonElement;
  public selectedParent: IAccountEntity | undefined;
  public parents!: IAccountEntity[];
  public teachers!: IAccountEntity[];
  maxlength = { maxlength: 512 };

  constructor(private fb: FormBuilder, public ut: UtilityService, private childService: ChildService,
    private accountService: AccountService, private formService: FormService,
    private nt: NotificationService,) {
    super();
  }

  ngOnInit(): void {
    this.childForm = this.fb.group({
      femaleFamilyMembers: [null, [Validators.max(99), Validators.min(0)]],
      maleFamilyMembers: [null, [Validators.max(99), Validators.min(0)]],
      birthOrder: [null, [Validators.max(99), Validators.min(0)]],
      parentsKinship: [null, [Validators.maxLength(512)]],
      diagnosticDate: null,
      pregnancyState: [null, [Validators.maxLength(512)]],
      birthState: [null, [Validators.maxLength(512)]],
      growthState: [null, [Validators.maxLength(512)]],
      diagnostic: [null, [Validators.maxLength(512)]],
      medicine: [null, [Validators.maxLength(512)]],
      behaviors: [null, [Validators.maxLength(512)]],
      prioritySkills: [null, [Validators.maxLength(512)]],
      parentId: [null],
      isArchive: [false],
      teachers: [[]]//array of IDs of teacher.
    });
    this.child = history.state.data;
    this.person = this.child?.person;
    this.sub = this.accountService.accounts.subscribe((v) => {
      this.parents = v.filter(v => v.roles.includes('Parent'));
      this.teachers = v.filter(v => v.roles.includes('Teacher'));
      if (this.child?.teachers)
        for (let c of this.child.teachers)
          this.teachers = this.teachers.map(t => c.id == t.id ? c : t);
    });

    if (this.child) {
      this.childForm?.setValue(this.formService.extractFrom(this.childForm.controls, this.child));
    }
  }


  calcFamilyMembers = (): string => {
    return (Number(this.childForm?.get('femaleFamilyMembers')?.value ?? 0)
      + Number(this.childForm?.get('maleFamilyMembers')?.value ?? 0)
      + 1).toString();
  }

  compare = (i: number, str: string): boolean => {
    return i > Number(str ?? 99) ?? 99
  }

  add = (str: string | null, bool: boolean): number => {
    if (bool) {
      return 1 + (Number(str || 0) || 0);
    } else return Number(str || 0) || 0;
  }


  async submit() {
    this.formService.trimFormGroup(this.personForm?.formGroup as FormGroup);
    this.formService.trimFormGroup(this.childForm)
    this.personForm?.formGroup?.markAllAsTouched();
    this.childForm?.markAllAsTouched();
    if (this.personForm?.formGroup?.valid && this.childForm?.valid) {
      this.childForm?.disable();
      this.personForm?.formGroup?.disable();

      this.ut.isLoading.next(true);
      FLAG: if (this.child?.id == null) {//Register a child
        let p: IPersonEntity | void = await this.personForm.submit().catch(() => { });
        if (!p || typeof p != 'object')
          break FLAG;
        try {
          let dirtyFields = this.formService.extractDirty(this.childForm.controls);
          await this.childService.postChild({ ...dirtyFields == null ? {} : dirtyFields, personId: p.id }, true);
          this.nt.notify("Added successfully", 'The new child has been registered successfully', 'success');
          this.ut.router.navigate(['/children']);
        } catch (e) {
          this.personForm.personService.deletePerson(p.id,true);//if creating a child run some problem but person created successfully then just delete the person :>
        }
      } else {//edit the child
        await this.personForm.submitEdit().catch(() => { });
        let dirtyFields = this.formService.extractDirty(this.childForm.controls);
        try {
          if (dirtyFields != null)
            await this.childService.patchChild(this.child.id, dirtyFields, true);
          this.nt.notify("Edited successfully", 'The child has been edited successfully', 'success');
          this.ut.router.navigate(['/children']);
        } catch (e) { }
      }
      this.childForm?.enable();
      this.personForm?.formGroup?.enable();
      this.ut.isLoading.next(false);
    } else this.nt.notify('Invalid Field', 'There are invalid fields!', 'error');
  }


  archiveChanged() {
    if (this.childForm.get('isArchive')?.value === true) {
      this.nt.showMsgDialog({
        title: { text: `Are you sure you want to archive this child?` },
        content: `Archiving a child will hide the child information from all pages and won't count their data in most report, such as children page. Only Admin can view archived children in the Children page by applying ‘Archive’ filter. Note: a parent of this child won't be able to view its information.`,
        type: 'confirm',
        buttons: [{ type: 'Cancel', color: 'primary' }, { type: 'Archive', color: 'warn' }]
      }).afterClosed().subscribe(v => {
        if (v !== 'Archive')
          this.childForm.get('isArchive')?.setValue(false);
      })
    }
  }

  showArchiveInfo() {
    this.nt.showMsgDialog({
      title: { text: 'Archive child information' },
      content: "Archiving a child will hide the child information from all pages and won't count their data in most report, such as children page. Only Admin can view archived children in the Children page by applying ‘Archive’ filter. Note: a parent of this child won't be able to view its information.",
      type: 'info',
    })
  }

  //!This is buggy
  // public isSubmitting: boolean = false;
  // @HostListener('window:beforeunload')
  // public canDeactivate(): boolean {//should NOT be arrow function
  //   // insert logic to check if there are pending changes here;
  //   if ((() => (this.childForm.dirty || this.personForm?.formGroup.dirty) && !this.isSubmitting)())//to access `this`
  //     return false; // returning false will show a confirm dialog before navigating away
  //   return true;// returning true will navigate without confirmation
  // }

}
