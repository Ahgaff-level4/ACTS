import { Component, ViewChild } from '@angular/core';
import { ICreateChild, ICreatePerson, IPersonEntity } from '../../../../../../../interfaces';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UtilityService } from 'src/app/services/utility.service';
import { ChildService } from 'src/app/services/child.service';
import { PersonFormComponent } from 'src/app/components/forms/person-form/person-form.component';

@Component({
  selector: 'app-add-edit-child',
  templateUrl: './add-edit-child.component.html',
  styleUrls: ['./add-edit-child.component.scss']
})
export class AddEditChildComponent {
  person: IPersonEntity = { age: 20, createdDatetime: new Date(2000, 5, 13), gender: 'Female', id: 7, name: 'Ahmad alkaf', birthDate: '1999-01-01' };//todo delete me
  public childForm: FormGroup;
  @ViewChild(PersonFormComponent) personForm!: PersonFormComponent;
  @ViewChild('submitButton') submitButton!:HTMLButtonElement;
  //todo add submit in person-form.component that will send API request to insert the person in the Database and return the person inserted id. So, we can use the id to insert a child or an account. See Class Diagram.
  constructor(private fb: FormBuilder, private ut: UtilityService, private childService: ChildService) {
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
      parentId: [null, [Validators.min(0)]],//todo select dialog
    });
  }

  updateFamilyMembers(input: HTMLInputElement) {
    input.value = (Number(this.childForm.controls['femaleFamilyMembers'].value ?? 0)
      + Number(this.childForm.controls['maleFamilyMembers'].value ?? 0)
      + 1).toString();
  }
  compare(i: number, str: string) {
    return i > Number(str ?? 99) ?? 99
  }
  add(str: string, bool: boolean) {
    if (bool) {
      return 1 + (Number(str ?? 0) ?? 0);
    } else return Number(str ?? 0) ?? 0;
  }
  maxlength = { maxlength: 512 };

  ordinalNumbers = ['First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth', 'Seventh', 'Eighth', 'Ninth', 'Tenth', 'Eleventh', 'Twelfth', 'Thirteenth', 'Fourteenth', 'Fifteenth', 'Sixteenth', 'Seventeenth', 'Eighteenth', 'Nineteenth', 'Twentieth', 'Twenty-first', 'Twenty-second', 'Twenty-third', 'Twenty-fourth', 'Twenty-fifth', 'Twenty-sixth', 'Twenty-seventh', 'Twenty-eighth', 'Twenty-ninth', 'Thirtieth']

  async submit() {
    this.personForm.formGroup.markAllAsTouched();
    this.childForm.markAllAsTouched();
    if (this.personForm.formGroup.valid && this.childForm.valid) {
      this.childForm.disable();
      this.personForm.formGroup.disable();
      this.submitButton.disabled = true;
      let person = await this.personForm.submit()
      let createChild:ICreateChild = this.childForm.value;
      createChild.personId = person.id;

      await this.childService.postChild(createChild);
      this.ut.showMsgDialog({type:'success',title:'Added successfully!',content:'Child was registered successfully'})
      .afterClosed().subscribe({next:()=>this.ut.router.navigate(['/children'])})

    } else this.ut.showMsgDialog({ title: 'Invalid Field', type: 'error', content: 'There are invalid fields!' })
    // this.personForm.valid; do not submit if person field
  }
}
