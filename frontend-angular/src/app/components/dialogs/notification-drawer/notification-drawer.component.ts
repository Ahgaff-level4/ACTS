import { Component } from '@angular/core';
import { PrivilegeService } from 'src/app/services/privilege.service';

@Component({
  selector: 'app-notification-drawer',
  templateUrl: './notification-drawer.component.html',
  styleUrls: ['./notification-drawer.component.scss']
})
export class NotificationDrawerComponent {
  constructor(public pr:PrivilegeService){}

}
