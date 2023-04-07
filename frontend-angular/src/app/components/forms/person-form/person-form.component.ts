import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ICreatePerson, IPersonEntity } from '../../../../../../interfaces';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';

@Component({
  selector: 'app-person-form',
  templateUrl: './person-form.component.html',
  styleUrls: ['./person-form.component.scss']
})
export class PersonFormComponent implements OnInit {
  @Output() personFormChanged: EventEmitter<FormGroup> = new EventEmitter<FormGroup>();
  @Input() person: IPersonEntity | undefined;//optional for edit
  @Input() personId: number | undefined;//optional for edit if you can't provide person then only id
  public formGroup!: FormGroup;
  public minlength = { minlength: 4 };
  public nowDate = new Date();

  ngOnInit(): void {
    console.log('person', this.person);
    console.log('personId', this.personId);
    this.formGroup.disable();
    if (this.person) {
      this.formGroup.get('name')?.setValue(this.person.name);
      this.formGroup.get('birthDate')?.setValue(this.person.birthDate);
      this.formGroup.get('gender')?.setValue(this.person.gender);
      this.formGroup.get('createdDatetime')?.setValue(this.person.createdDatetime);
    }//todo if necessary: else if(this.personId){//fetch person info}
    this.formGroup.enable();
    this.personFormChanged.emit(this.formGroup);
  }

  constructor(private fb: FormBuilder) {
    this.formGroup = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(50), Validators.minLength(4)]],
      birthDate: '',
      gender: ['', [Validators.required]],
      createdDatetime: [new Date(), [Validators.required]],
    });
  }

}
