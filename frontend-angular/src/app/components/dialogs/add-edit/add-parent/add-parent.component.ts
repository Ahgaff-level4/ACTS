import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { IAccountEntity } from '../../../../../../../interfaces';

@Component({
  selector: 'app-add-parent',
  templateUrl: './add-parent.component.html',
  styleUrls: ['./add-parent.component.scss']
})
export class AddParentComponent {
  constructor(public dialogRef: MatDialogRef<any>,@Inject(MAT_DIALOG_DATA) public defaultPersonName:string) { }
}
