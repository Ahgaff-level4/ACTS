import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ICreatePerson, IPersonEntity } from '../../../../../../interfaces';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';

@Component({
  selector: 'app-person-form',
  templateUrl: './person-form.component.html',
  styleUrls: ['./person-form.component.scss']
})
export class PersonFormComponent implements OnInit{
  @Output() personFormChanged:EventEmitter<FormGroup> = new EventEmitter<FormGroup>();
  public minlength = {minlength:4}
  public formGroup;

  ngOnInit(): void {
    this.personFormChanged.emit(this.formGroup);

  }
  constructor(private fb: FormBuilder) {
    this.formGroup = this.fb.group({
      name: ['', Validators.required,Validators.maxLength(50),Validators.minLength(4)],
      birthDate:'',
      gender: ['', Validators.required],
      createdDate: [new Date(), Validators.required],
    });
  }

  formatDate(event: MatDatepickerInputEvent<Date>) {
    this.formGroup.controls['birthDate'].setValue(event.value?.toISOString()??null);
  }

  formatDate2(event: MatDatepickerInputEvent<Date>) {
    this.formGroup.controls['createdDate'].setValue(event.value);
  }

}
