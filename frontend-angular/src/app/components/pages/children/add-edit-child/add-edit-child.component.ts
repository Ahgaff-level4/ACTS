import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { IAccountEntity, IChildEntity, ICreatePerson, IPersonEntity } from '../../../../../../../interfaces';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DisplayService } from 'src/app/services/display.service';
import { ChildService } from 'src/app/services/CRUD/child.service';
import { PersonFormComponent } from 'src/app/components/forms/person-form/person-form.component';
import { AccountService } from 'src/app/services/CRUD/account.service';
import { UnsubOnDestroy } from 'src/app/unsub-on-destroy';
import { FormService } from 'src/app/services/form.service';
import { NotificationService } from 'src/app/services/notification.service';
import { ProgramService } from 'src/app/services/CRUD/program.service';
import { AddParentComponent } from 'src/app/components/dialogs/add-edit/add-parent/add-parent.component';
import { iif, of } from 'rxjs';
import { Router } from '@angular/router';

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
  //Used as placeholder to choose a parent
  public parentNameControl = new FormControl('');
  maxlength = { maxlength: 512 };

  constructor(private fb: FormBuilder, public display: DisplayService, private childService: ChildService,
    private accountService: AccountService, public formService: FormService, private router:Router,
    private nt: NotificationService, public programService: ProgramService) {
    super();
  }

  ngOnInit(): void {
    this.childForm = this.fb.group({
      femaleFamilyMembers: [null, [Validators.max(99), Validators.min(0)]],
      maleFamilyMembers: [null, [Validators.max(99), Validators.min(0)]],
      birthOrder: [null, [Validators.max(99), Validators.min(0)]],
      parentsKinship: [null, [Validators.maxLength(512)]],
      diagnosticDate: [null,],
      pregnancyState: [null, [Validators.maxLength(512)]],
      birthState: [null, [Validators.maxLength(512)]],
      growthState: [null, [Validators.maxLength(512)]],
      diagnostic: [null, [Validators.maxLength(512)]],
      medicine: [null, [Validators.maxLength(512)]],
      behaviors: [null, [Validators.maxLength(512)]],
      prioritySkills: [null, [Validators.maxLength(512)]],
      parentId: [null],
      programId: [null],
      isArchive: [false],
      teachers: [[]]//array of IDs of teacher.
    });
    this.child = history.state.data;
    this.person = this.child?.person;
    this.sub.add(this.accountService.accounts$.subscribe((v) => {
      if (v == undefined) {
        this.accountService.fetch();
        return;
      }
      this.parents = v.filter(v => v.roles.includes('Parent'));
      if (typeof this.child?.parentId == 'number')
        this.parentNameControl.setValue(this.parents.find(v => v.id == this.child!.parentId)?.person.name ?? '')

      this.searchedParents = [...this.parents].filter(p => p.person.name.toLowerCase().includes(this.parentNameControl.value?.toLowerCase() ?? ''));
      this.teachers = v.filter(v => v.roles.includes('Teacher'));
      if (this.child?.teachers)
        for (let c of this.child.teachers)
          this.teachers = this.teachers.map(t => c.id == t.id ? c : t);
    }));

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
    if (this.personForm?.formGroup?.valid && this.childForm?.valid && this.parentNameControl.valid) {
      this.childForm?.disable();
      this.personForm?.formGroup?.disable();

      this.display.isLoading.next(true);
      FLAG: if (this.child?.id == null) {//Register a child
        let p: IPersonEntity | void = await this.personForm.submit().catch(() => { });
        if (!p || typeof p != 'object')
          break FLAG;
        try {
          let dirtyFields = this.formService.extractDirty(this.childForm.controls);
          await this.childService.postChild({ ...dirtyFields == null ? {} : dirtyFields, personId: p.id }, true);
          this.nt.notify("Added successfully", 'The new child has been registered successfully', 'success');
          this.router.navigate(['/children']);
        } catch (e) {
          this.personForm.personService.deletePerson(p.id, true);//if creating a child run some problem but person created successfully then just delete the person :>
        }
      } else {//edit the child
        await this.personForm.submitEdit().catch(() => { });
        let dirtyFields = this.formService.extractDirty(this.childForm.controls);
        try {
          if (dirtyFields != null)
            await this.childService.patchChild(this.child.id, dirtyFields, true);
          this.nt.notify("Edited successfully", 'The child has been edited successfully', 'success');
          this.router.navigate(['/children']);
        } catch (e) { }
      }
      this.childForm?.enable();
      this.personForm?.formGroup?.enable();
      this.display.isLoading.next(false);
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
  public searchedParents: IAccountEntity[] = [];//will be initialize onInit()
  keyUpParentName(name: string) {
    name = name.toLowerCase();
    this.childForm.get('parentId')!.markAllAsTouched();
    this.childForm.get('parentId')!.markAsDirty();

    const chosenParent = this.parents.find(v => v.person.name.toLowerCase() === name);
    if (!chosenParent) {
      this.parentNameControl.setErrors({ noParent: { name } });
      this.childForm.get('parentId')!.setValue(null);
    }
    else {
      this.parentNameControl.setErrors(null);
      this.childForm.get('parentId')!.setValue(chosenParent.id);
    }
    this.searchedParents = this.parents.filter(v => v.person.name.toLowerCase().includes(name));
  }

  showAddParentDialog() {
    this.nt.openDialog<AddParentComponent, string, IAccountEntity>(AddParentComponent, this.parentNameControl.value ?? '').afterClosed().subscribe(v => {
      if (!v)
        throw 'Unexpected new parent account';
      iif(() => !!this.parents.find(p => p.person.name == v.person.name),
        of(v),
        of(this.accountService.accounts$.value?.find(p => p.roles.includes('Parent') && p.person.name == v.person.name)))
        .subscribe(v => {
          this.parentNameControl.setValue(v?.person.name ?? '');
          this.keyUpParentName(v?.person.name ?? '');
        })
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
