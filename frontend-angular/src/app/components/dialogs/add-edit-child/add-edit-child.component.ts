import { Component, Inject } from '@angular/core';

import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { IChildEntity } from '../../../../../../interfaces';

@Component({
  selector: 'app-add-edit-child',
  templateUrl: './add-edit-child.component.html',
  styleUrls: ['./add-edit-child.component.scss']
})
export class AddEditChildComponent {
  constructor(public dialogRef: MatDialogRef<any>, @Inject(MAT_DIALOG_DATA) public data: IChildEntity | null,) {}
  add(){

  }

  edit(){
    
  }
}
