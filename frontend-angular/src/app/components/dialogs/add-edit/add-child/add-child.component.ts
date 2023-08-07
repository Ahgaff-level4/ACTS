import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-add-child',
  templateUrl: './add-child.component.html',
  styleUrls: ['./add-child.component.scss']
})
export class AddChildComponent {
  constructor(public dialogRef: MatDialogRef<any>,@Inject(MAT_DIALOG_DATA) public setTeacherParent:{state:'teacher'|'parent',accountId:number}) { }

}
