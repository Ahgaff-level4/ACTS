import { Component } from '@angular/core';
import { ICreatePerson, IPersonEntity } from '../../../../../../../interfaces';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-add-edit-child',
  templateUrl: './add-edit-child.component.html',
  styleUrls: ['./add-edit-child.component.scss']
})
export class AddEditChildComponent {
  person: IPersonEntity = { age: 20, createdDatetime: new Date(2000, 5, 13), gender: 'Female', id: 7, name: 'Ahmad alkaf', birthDate: '1999-01-01' };//todo delete me
  public childForm: FormGroup;
  public personForm!: FormGroup;//We will use personForm which is component we made it in forms/person-form. So, any time we want to make a form that contains person information we will use that person-form.component. personForm send us formGroup object that has all what we need from that form (e.g., is it valid or what is the data user entered).
  //todo add submit in person-form.component that will send API request to insert the person in the Database and return the person inserted id. So, we can use the id to insert a child or an account. See Class Diagram.
  constructor(private fb: FormBuilder) {
    this.childForm = this.fb.group({
      femaleFamilyMembers: ['0', [Validators.max(99), Validators.min(0)]],
      maleFamilyMembers: ['0', [Validators.max(99), Validators.min(0)]],
      birthOrder: ['', [Validators.max(99), Validators.min(0)]],
      parentsKinship: ['', [Validators.maxLength(512)]],
      diagnosticDate: '',
      pregnancyState: ['', [Validators.maxLength(512)]],
      birthState: ['', [Validators.maxLength(512)]],
      growthState: ['', [Validators.maxLength(512)]],
      diagnostic: ['', [Validators.maxLength(512)]],
      medicine: ['', [Validators.maxLength(512)]],
      behaviors: ['', [Validators.maxLength(512)]],
      prioritySkills: ['', [Validators.maxLength(512)]],
      parentId: ['', [Validators.min(0)]],//todo select dialog


      // diagnosticDate:['',[Validators]]
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

  submit() {
    this.personForm?.markAllAsTouched();//to validate all fields in personForm. So, if a field is required will turn red/error
    // this.personForm.valid; do not submit if person field
  }
}
