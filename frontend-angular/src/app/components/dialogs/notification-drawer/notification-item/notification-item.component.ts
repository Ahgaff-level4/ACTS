import { AfterViewInit, Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { DisplayService } from 'src/app/services/display.service';
import { NotificationService, NotificationShape } from 'src/app/services/notification.service';
import { UtilityService } from 'src/app/services/utility.service';

@Component({
  selector: 'app-notification-item',
  templateUrl: './notification-item.component.html',
  styleUrls: ['./notification-item.component.scss']
})
export class NotificationItemComponent implements AfterViewInit {
  @ViewChild('template') template!: TemplateRef<any>;
  @Input() item: NotificationShape | undefined = undefined;
  @Input() dialogRef: MatDialogRef<any> | undefined;

  constructor(private nt: NotificationService, public ut: UtilityService,
    public display: DisplayService) { }

  getNzType(icon: string) {
    switch (icon) {
      case 'success': return 'check-circle';
      case 'warning': return 'info-circle';
      case 'error': return 'close-circle'
      default: return icon;
    }
  }

  getNzColor(icon: string) {
    switch (icon) {
      case 'success': return 'text-success';
      case 'warning': return 'text-warning';
      case 'error': return 'my-warn-text'
      default: return icon;
    }
  }



  ngAfterViewInit(): void {
    this.nt.setTemplate(this.template);//send the template to the NotificationService so that it can use it for any notification `nt.notify(...)` call
  }
}
