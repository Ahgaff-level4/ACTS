import { AfterViewInit, Component, Input, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { DisplayService } from 'src/app/services/display.service';
import { NotificationIcon, NotificationService, NotificationShape } from 'src/app/services/notification.service';
import { UtilityService } from 'src/app/services/utility.service';

@Component({
  selector: 'app-notification-item',
  templateUrl: './notification-item.component.html',
  styleUrls: ['./notification-item.component.scss']
})
export class NotificationItemComponent implements AfterViewInit, OnDestroy {
  @ViewChild('template') template!: TemplateRef<any>;
  @Input() item: NotificationShape | undefined = undefined;
  @Input() dialogRef: MatDialogRef<any> | undefined;

  constructor(public nt: NotificationService, public ut: UtilityService,
    public display: DisplayService) { this.item = undefined}

  getNzType(icon: NotificationIcon) {
    switch (icon) {
      case 'success': return 'check-circle';
      case 'warning': return 'warning';
      case 'error': return 'close-circle';
      case 'info': return 'info-circle';
      default: return icon.nzType ?? 'info-circle';
    }
  }

  getNzColor(icon: NotificationIcon) {
    switch (icon) {
      case 'success': return 'text-success';
      case 'warning': return 'text-warning';
      case 'error': return 'my-warn-text';
      case 'info': return 'text-info';
      default: return icon.class ?? 'text-info';
    }
  }

  ngAfterViewInit(): void {
    this.nt.setTemplate(this.template);//send the template to the NotificationService so that it can use it for any notification `nt.notify(...)` call
  }

  ngOnDestroy(): void {
    this.item = undefined;
  }
}
