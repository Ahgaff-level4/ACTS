import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { DisplayService } from 'src/app/services/display.service';
import { NotificationService, OnlineAccount } from 'src/app/services/notification.service';
import { PrivilegeService } from 'src/app/services/privilege.service';
import { SendMessageComponent } from './send-message/send-message.component';

@Component({
  selector: 'app-notification-drawer',
  templateUrl: './notification-drawer.component.html',
  styleUrls: ['./notification-drawer.component.scss']
})
export class NotificationDrawerComponent {
  constructor(public pr: PrivilegeService, public nt: NotificationService,
    public dialogRef: MatDialogRef<any>, public display: DisplayService,) { }

  openSendMessageDialog(account?: OnlineAccount) {
    this.nt.openDialog(SendMessageComponent, account);
  }
}
