import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { UtilityService } from 'src/app/services/utility.service';
@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.scss']
})
export class MessageDialogComponent implements OnInit {
  constructor(public dialogRef: MatDialogRef<any>, @Inject(MAT_DIALOG_DATA) private data: MessageDialogData,) {
    this.type = this.data.type;
    this.content = this.data.content;
    this.button = this.data.button ?? 'Ok';
  }
  public content: string;
  public type: DialogType;
  public button: ButtonType;

  public get title(): string {
    if (typeof this.data.title === 'string')
      return this.data.title;
    else if (this.data.type === 'error')
      return 'Error!';
    else if (this.data.type === 'info')
      return 'Information';
    else if (this.data.type === 'success')
      return 'Success!';
    else {
      console.error('MessageDialogComponent : title : title value was not expected!', this.data);
      return '...';
    }
  }


  ngOnInit(): void {
  }

}

export interface MessageDialogData {
  /** default depends on type if `type='error'` then `title='Error'`...etc */
  title?: string;
  content: string;
  type: DialogType;
  /** default is `Ok` */
  button?: ButtonType
}
type DialogType = 'error' | 'info' | 'success';
type ButtonType = 'Ok' | 'Cancel';
