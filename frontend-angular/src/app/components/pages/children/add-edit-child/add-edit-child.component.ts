import { Component } from '@angular/core';
import { ICreatePerson } from '../../../../../../../interfaces';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-add-edit-child',
  templateUrl: './add-edit-child.component.html',
  styleUrls: ['./add-edit-child.component.scss']
})
export class AddEditChildComponent {
  constructor() {
  }

  public personForm!:FormGroup;

}
