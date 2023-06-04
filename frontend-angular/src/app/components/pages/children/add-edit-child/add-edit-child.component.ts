import { AfterViewChecked, AfterViewInit, Component, Input, OnDestroy, OnInit, ViewChild, HostListener } from '@angular/core';
import { IAccountEntity, IChildEntity, ICreatePerson, IPersonEntity } from '../../../../../../../interfaces';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UtilityService } from 'src/app/services/utility.service';
import { ChildService } from 'src/app/services/child.service';
import { PersonFormComponent } from 'src/app/components/forms/person-form/person-form.component';
import { Observable, Subscription } from 'rxjs';
import { AccountService } from 'src/app/services/account.service';
import { ComponentCanDeactivate } from 'src/app/app-routing.module';

@Component({
  selector: 'app-add-edit-child',
  templateUrl: './add-edit-child.component.html',
  styleUrls: ['./add-edit-child.component.scss']
})
export class AddEditChildComponent implements OnInit, OnDestroy, AfterViewInit, ComponentCanDeactivate {
  public childForm!: FormGroup;
  public person?: IPersonEntity | ICreatePerson;
  public child: IChildEntity | undefined;//child information to be edit or undefined for new child
  @ViewChild(PersonFormComponent) personForm?: PersonFormComponent;
  @ViewChild('submitButton') submitButton!: HTMLButtonElement;
  public selectedParent: IAccountEntity | undefined;
  public parents!: IAccountEntity[];
  public teachers!: IAccountEntity[];
  public sub!: Subscription;
  maxlength = { maxlength: 512 };
  /**Used to show the add-edit form in children table. If `readonlyChild` exist then do not show title, submit, and every control should be readonly */
  @Input('child') readonlyChild: IChildEntity | undefined;

  constructor(private fb: FormBuilder, public ut: UtilityService, private childService: ChildService, private accountService: AccountService) {
  }

  ngOnInit(): void {
    // window.onload = ()=> {
    // var confirmationMessage = this.ut.translate('Changes you made may not be saved.');
    // window.addEventListener("beforeunload", function (e) {
    //   if (false) {//do not prevent leaving the page
    //     return undefined;
    //   }


    //   (e || window.event).returnValue = confirmationMessage; //Gecko + IE
    //   return confirmationMessage; //Gecko + Webkit, Safari, Chrome etc.
    // });
    // };
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
      let child = this.readonlyChild ? this.readonlyChild : this.child;
      if (child?.teachers)
        for (let c of child.teachers)
          this.teachers = this.teachers.map(t => c.id == t.id ? c : t);
    });

    if (this.child) {
      this.childForm?.setValue(this.ut.extractFrom(this.childForm.controls, this.child));
    }
  }

  async ngAfterViewInit() {
    if (this.readonlyChild && this.personForm) {//if add-edit shows in readonly mode, AKA in children table
      this.childForm.disable();
      this.personForm.formGroup.disable();
      this.childForm.setValue(this.ut.extractFrom(this.childForm.controls, this.readonlyChild));
      this.personForm.formGroup.setValue(this.ut.extractFrom(this.personForm.formGroup.controls, this.readonlyChild.person))
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
    this.isSubmitting = true;
    setTimeout(()=>this.isSubmitting = false,100);
    if (this.readonlyChild)
      return;//can not perform submit when showing the form in readonly mode

    this.ut.trimFormGroup(this.personForm?.formGroup as FormGroup);
    this.ut.trimFormGroup(this.childForm)
    this.personForm?.formGroup?.markAllAsTouched();
    this.childForm?.markAllAsTouched();
    if (this.personForm?.formGroup?.valid && this.childForm?.valid) {
      this.childForm?.disable();
      this.personForm?.formGroup?.disable();

      this.ut.isLoading.next(true);
      FLAG: if (this.child?.id == null) {//Register a child
        let p: IPersonEntity | void = await this.personForm.submit().catch(() => { });
        if (typeof p != 'object')
          break FLAG;
        try {
          let dirtyFields = this.ut.extractDirty(this.childForm.controls);
          await this.childService.postChild({ ...dirtyFields == null ? {} : dirtyFields, personId: p.id }, true);
          this.ut.notify("Added successfully", 'The new child has been registered successfully', 'success');
          this.ut.router.navigate(['/children']);
        } catch (e) {
          this.personForm.personService.deletePerson(p.id);//if creating a child run some problem but person created successfully then just delete the person :>
        }
      } else {//edit the child
        await this.personForm.submitEdit().catch(() => { });
        let dirtyFields = this.ut.extractDirty(this.childForm.controls);
        try {
          if (dirtyFields != null)
            await this.childService.patchChild(this.child.id, dirtyFields, true);
          this.ut.notify("Edited successfully", 'The child has been edited successfully', 'success');
          this.ut.router.navigate(['/children']);
        } catch (e) { }
      }
      this.childForm?.enable();
      this.personForm?.formGroup?.enable();
      this.ut.isLoading.next(false);
    } else this.ut.notify('Invalid Field', 'There are invalid fields!', 'error');

    // this.personForm.valid; do not submit if person field
  }


  archiveChanged() {
    if (this.childForm.get('isArchive')?.value === true) {
      this.ut.showMsgDialog({
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

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  public isSubmitting: boolean =  false;
  @HostListener('window:beforeunload')
  public canDeactivate(): boolean {//should NOT be arrow function
    // insert logic to check if there are pending changes here;
    if ((() => (this.childForm.dirty || this.personForm?.formGroup.dirty)&&!this.isSubmitting)())//to access `this`
      return false; // returning false will show a confirm dialog before navigating away
    return true;// returning true will navigate without confirmation
  }

}
