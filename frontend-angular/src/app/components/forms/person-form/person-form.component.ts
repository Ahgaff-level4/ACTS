import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ICreatePerson, IPersonEntity } from '../../../../../../interfaces';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { PersonService } from 'src/app/services/person.service';

@Component({
  selector: 'app-person-form',
  templateUrl: './person-form.component.html',
  styleUrls: ['./person-form.component.scss']
})
export class PersonFormComponent implements OnInit {
  @Input() public person: IPersonEntity | undefined;//optional for edit
  @Input() public personId: number | undefined;//optional for edit if you can't provide person then only id
  public formGroup!: FormGroup;
  protected minlength = { minlength: 4 };
  protected nowDate = new Date();

  ngOnInit(): void {
    this.formGroup.disable();
    if (this.person) {
      this.formGroup.get('name')?.setValue(this.person.name);
      this.formGroup.get('birthDate')?.setValue(this.person.birthDate);
      this.formGroup.get('gender')?.setValue(this.person.gender);
      this.formGroup.get('createdDatetime')?.setValue(this.person.createdDatetime);
    }//todo if necessary: else if(this.personId){//fetch person info}
    this.formGroup.enable();
  }

  constructor(private fb: FormBuilder, private personService: PersonService) {
    this.formGroup = this.fb.group({
      name: [null, [Validators.required, Validators.maxLength(50), Validators.minLength(4)]],
      birthDate: null,
      gender: [null, [Validators.required]],
      createdDatetime: [new Date(), [Validators.required]],
    });
  }

  /**
   * Called by the parent component. Hint: using `@ViewChild` decorator
   */
  public async submit(): Promise<IPersonEntity> {
      // if (this.person?.id || this.personId) {//edit person
        //for editing...
        // return await this.personService.patchPerson(this.formGroup);
      // } else {//add new person
      console.log('personFormGroup.value',this.formGroup.value);
        return await this.personService.postPerson(this.formGroup.value);
        // return await this.personService.postPerson(this.formGroup.value)
      // }
  }

}
