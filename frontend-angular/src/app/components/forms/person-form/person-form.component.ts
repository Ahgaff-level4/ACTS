import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ICreatePerson, IPersonEntity } from '../../../../../../interfaces';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-person-form',
  templateUrl: './person-form.component.html',
  styleUrls: ['./person-form.component.scss']
})
export class PersonFormComponent {
  @Input() person!:ICreatePerson;
  @Output() personChange = new EventEmitter<ICreatePerson>();

  formGroup:FormGroup;
  constructor(private fb:FormBuilder){
    this.formGroup = fb.group({
      name:['',Validators.required],
      birthDate:'',
      gender:['',Validators.required],
      createdDatetime:[new Date(),Validators.required]
    })
  }
}
