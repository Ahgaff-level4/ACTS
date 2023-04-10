import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { UtilityService } from 'src/app/services/utility.service';
@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.scss']
})
export class MessageDialogComponent {
  constructor(public dialogRef: MatDialogRef<any>, @Inject(MAT_DIALOG_DATA) private data: MessageDialogData,) {
    this.type = this.data.type;
    this.content = this.data.content;
    this.buttons = this.data.buttons ?? [{color:'primary',type:'Ok'}];
  }
  public content: string;
  public type: DialogType;
  public buttons:{color:'primary'|'accent'|'warn',type:ButtonType}[];

  public get title(): string {
    if (typeof this.data.title === 'string')
      return this.data.title;
    else if (this.data.type === 'error')
      return 'Error!';
    else if (this.data.type === 'info')
      return 'Information';
    else if (this.data.type === 'success')
      return 'Success!';
    else if (this.data.type === 'confirm')
      return 'Are you sure?';
    else {
      console.error('MessageDialogComponent : title : title value was not expected!', this.data);
      return '...';
    }
  }

}

export interface MessageDialogData {
  /** default depends on type if `type='error'` then `title='Error'`...etc */
  title?: string;
  content: string;
  type: DialogType;
  /** default is `Ok`, color `primary` */
  buttons?:{color:'primary'|'accent'|'warn',type:ButtonType}[]
}
type DialogType = 'error' | 'info' | 'success' | 'confirm';
type ButtonType = 'Ok' | 'Cancel'|'Yes'|'No'|'Delete';
