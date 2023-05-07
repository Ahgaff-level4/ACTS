import { AfterViewChecked, AfterViewInit, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { IAccountEntity, IChildEntity, ICreatePerson, IPersonEntity } from '../../../../../../../interfaces';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UtilityService } from 'src/app/services/utility.service';
import { ChildService } from 'src/app/services/child.service';
import { PersonFormComponent } from 'src/app/components/forms/person-form/person-form.component';
import { Subscription } from 'rxjs';
import { AccountService } from 'src/app/services/account.service';

@Component({
  selector: 'app-add-edit-child',
  templateUrl: './add-edit-child.component.html',
  styleUrls: ['./add-edit-child.component.scss']
})
export class AddEditChildComponent implements OnInit, OnDestroy, AfterViewInit {
  public childForm!: FormGroup;
  public person?: IPersonEntity | ICreatePerson;
  public child: IChildEntity | undefined;//child information to be edit or undefined for new child
  @ViewChild(PersonFormComponent) personForm?: PersonFormComponent;
  @ViewChild('submitButton') submitButton!: HTMLButtonElement;
  public selectedParent: IAccountEntity | undefined;
  public parents!: IAccountEntity[];
  public sub!: Subscription;
  maxlength = { maxlength: 512 };
  /**Used to show the add-edit form in children table. If `readonlyChild` exist then do not show title, submit, and every control should be readonly */
  @Input('child') readonlyChild: IChildEntity | undefined;

  constructor(private fb: FormBuilder, public ut: UtilityService, private childService: ChildService, private accountService: AccountService) {
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
      isArchive: [false]
    });
    this.child = history.state.data;
    this.person = this.child?.person;
    this.sub = this.accountService.accounts.subscribe((v) => {
      this.parents = v.filter(v => v.roles.includes('Parent'));
    });
    if (this.accountService.accounts.value.length == 0)
      this.accountService.fetch(true);
    if (this.child) {
      this.childForm?.setValue(this.ut.extractFrom(this.childForm.controls, this.child));
    }
  }

  ngAfterViewInit() {
    if (this.readonlyChild && this.personForm) {//if add-edit shows in readonly mode, AKA in children table
      this.childForm.disable();
      this.personForm.formGroup.disable();
      this.childForm.setValue(this.ut.extractFrom(this.childForm.controls,this.readonlyChild));
      this.personForm.formGroup.setValue(this.ut.extractFrom(this.personForm.formGroup.controls,this.readonlyChild.person))
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
      if (this.child?.id == null) {//Register a child
        let p: IPersonEntity = await this.personForm.submit();
        try {
          let dirtyFields = this.ut.extractDirty(this.childForm.controls);
          await this.childService.postChild({ ...dirtyFields == null ? {} : dirtyFields, personId: p.id }, true);
          this.ut.showSnackbar('The new child has been registered successfully.');
          this.ut.router.navigate(['/children']);
        } catch (e) {
          this.personForm.personService.deletePerson(p.id);//if creating a child run some problem but person created successfully then just delete the person :>
        }
      } else {//edit the child
        await this.personForm.submitEdit();
        let dirtyFields = this.ut.extractDirty(this.childForm.controls);
        console.log('child', this.child);
        if (dirtyFields != null)
          await this.childService.patchChild(this.child.id, dirtyFields, true);
        this.ut.showSnackbar('The child has been edited successfully.');
        this.ut.router.navigate(['/children']);
      }
      this.childForm?.enable();
      this.personForm?.formGroup?.enable();
      this.ut.isLoading.next(false);

    } else this.ut.showMsgDialog({ title: { text: 'Invalid Field' }, type: 'error', content: 'There are invalid fields!' })
    // this.personForm.valid; do not submit if person field
  }


  archiveChanged() {
    if (this.childForm.get('isArchive')?.value === true) {
      this.ut.showMsgDialog({
        title: { text: `Are you sure you want to archive this child?` },
        content: `Archiving a child will hide their information from other pages, such as goals and parents. You can only view archived children in the Children page by applying the ‘Show archived children’ filter. This action requires admin privilege.`,
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

}
