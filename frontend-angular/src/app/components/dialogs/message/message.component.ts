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
  public titleText: string;
  public titleColor?: TitleColor;
  public titleIcon?: TitleIcon;
  public content: string;
  public type: DialogType;
  public buttons: { color: 'primary' | 'accent' | 'warn', type: ButtonType }[];

  constructor(public dialogRef: MatDialogRef<any>, @Inject(MAT_DIALOG_DATA) private data: MessageDialogData,) {
    this.type = this.data.type;
    this.content = this.data.content;
    this.buttons = this.data.buttons ?? [{ color: 'primary', type: 'Ok' }];

    this.titleText = this.getTitleText(this.data?.title?.text);
    this.titleColor = this.getTitleColor(this.data?.title?.color);
    this.titleIcon = this.getTitleIcon(this.data?.title?.icon);
  }

  private getTitleText(titleText: string | undefined): string {
    if (typeof titleText === 'string')
      return titleText;
    else if (this.data.type === 'error')
      return 'Error!';
    else if (this.data.type === 'info')
      return 'Information';
    else if (this.data.type === 'success')
      return 'Success!';
    // else if (this.data.type === 'delete')
    //   return 'text-danger';
    else if (this.data.type === 'confirm')
      return 'Are you sure?';
    console.error('MessageDialogComponent : title value was not expected!', this.data);

    return '';
  }

  private getTitleColor(titleColor: TitleColor | undefined): TitleColor {
    if (typeof titleColor === 'string')
      return titleColor;
    else if (this.data.type === 'error')
      return 'text-danger';
    else if (this.data.type === 'info')
      return 'text-warning';
    else if (this.data.type === 'success')
      return 'text-success';
    // else if (this.data.type === 'delete')
    //   return 'text-danger';
    else if (this.data.type === 'confirm')
      return 'text-danger';
    return '';
  }

  private getTitleIcon(titleIcon: TitleIcon | undefined): TitleIcon {
    if (typeof titleIcon === 'string')
      return titleIcon;
    else if (this.data.type === 'error')
      return 'error';
    else if (this.data.type === 'info')
      return 'info';
    else if (this.data.type === 'success')
      return 'check_circle';
    // else if (this.data.type === 'delete')
    //   return 'delete';
    else if (this.data.type === 'confirm')
      return 'warning';
    return undefined;
  }

}

export interface MessageDialogData {
  /** default depends on type. Ex: if `type='error'` then `title={text:'Error',color:'text-danger',icon:'error'}`...etc */
  title?: { text: string, color?: TitleColor, icon?: TitleIcon, };
  content: string;
  /** Icon, Title text, and Title color are set by default based on the dialog type. If title object not declared */
  type: DialogType;
  /** default is `Ok`, color `primary` */
  buttons?: { color: 'primary' | 'accent' | 'warn', type: ButtonType }[]
}
type TitleColor = 'text-danger' | 'text-success' | 'text-warning' | '';
type TitleIcon = 'error' | 'warning' | 'info' | 'delete' | 'person_remove' | 'archive' | 'check_circle' | undefined;
type DialogType = 'error' | 'info' | 'success' | 'confirm' //| 'delete';
export type ButtonType = 'Ok' | 'Cancel' | 'Yes' | 'No' | 'Delete' | 'Login' | 'Archive';
