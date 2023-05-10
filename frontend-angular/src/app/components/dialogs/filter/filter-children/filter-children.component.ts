import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { map } from 'rxjs';

@Component({
  selector: 'app-filter-children',
  templateUrl: './filter-children.component.html',
  styleUrls: ['./filter-children.component.scss']
})
export class FilterChildrenComponent {
  public nowDate = new Date();
  public filter

  /**
   * opener: is the component that open this dialog.
   *  dialogRef.close(data); data should be:
   * 1- `object of FilterChildrenOptions` So, onClose the opener will apply the filter.
   * 2- `undefined` onClose the opener will ignore the filter.
   */
  constructor(@Inject(MAT_DIALOG_DATA) public data: FilterChildrenOptions,
    public dialogRef: MatDialogRef<any>) {
    this.filter = {...data};//immutable so the opener passed object do not change unless the user apply the filter
  }


}

export interface FilterChildrenOptions {
  minRegisterDate?: Date;
  maxRegisterDate?: Date;
}
