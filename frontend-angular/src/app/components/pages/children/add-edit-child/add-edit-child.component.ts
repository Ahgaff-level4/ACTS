import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { IChildEntity, ICreateChild, ICreatePerson, IPersonEntity } from '../../../../../../../interfaces';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UtilityService } from 'src/app/services/utility.service';
import { ChildService } from 'src/app/services/child.service';
import { PersonFormComponent } from 'src/app/components/forms/person-form/person-form.component';

@Component({
  selector: 'app-add-edit-child',
  templateUrl: './add-edit-child.component.html',
  styleUrls: ['./add-edit-child.component.scss']
})
export class AddEditChildComponent implements OnInit {
  public childForm: FormGroup;
  public person?: IPersonEntity | ICreatePerson;
  public child: IChildEntity | undefined;//child information to be edit or undefined for new child
  @ViewChild(PersonFormComponent) personForm?: PersonFormComponent;
  @ViewChild('submitButton') submitButton!: HTMLButtonElement;

  constructor(private fb: FormBuilder, public ut: UtilityService, private childService: ChildService) {
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
      parentId: [null]//todo
    });
    this.child = history.state.data;
    this.person = this.child?.person;
    if (this.child) {
      this.childForm?.setValue(this.ut.extractFrom(this.childForm.controls, this.child));
    }
    console.log('child',this.child);
  }

  ngOnInit(): void {
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
  maxlength = { maxlength: 512 };


  async submit() {
    this.personForm?.formGroup?.markAllAsTouched();
    this.childForm?.markAllAsTouched();
    if (this.personForm?.formGroup?.valid && this.childForm?.valid) {
      this.childForm?.disable();
      this.personForm?.formGroup?.disable();
      this.submitButton.disabled = true;
      if (this.child?.id == null) {//Register a child
        let p: IPersonEntity = await this.personForm.submit();
        try {
          let dirtyFields = this.ut.extractDirty(this.childForm.controls);
          await this.childService.postChild({ ...dirtyFields==null?{}:dirtyFields, personId: p.id });
          this.ut.showMsgDialog({ type: 'success', title: 'Added successfully!', content: 'The new child has been registered successfully.', button: 'Ok' })
            .afterClosed().subscribe({ next: () => this.ut.router.navigate(['/children']) });
        } catch (e) {
          this.personForm.personService.deletePerson(p.id);//if creating a child run some problem but person created successfully then just delete the person :>
        }
      } else {//edit the child
        await this.personForm.submitEdit();
        let dirtyFields = this.ut.extractDirty(this.childForm.controls);
        console.log('child',this.child);
        if (dirtyFields != null)
          await this.childService.patchChild(this.child.id, dirtyFields);
        this.ut.showMsgDialog({ type: 'success', title: 'Edited successfully!', content: 'The child has been edited successfully.', button: 'Ok' })
          .afterClosed().subscribe({ next: () => this.ut.router.navigate(['/children']) });
      }
      this.childForm?.enable();
      this.personForm?.formGroup?.enable();
      this.submitButton.disabled = false;

    } else this.ut.showMsgDialog({ title: 'Invalid Field', type: 'error', content: 'There are invalid fields!', button: 'Ok' })
    // this.personForm.valid; do not submit if person field
  }

}
