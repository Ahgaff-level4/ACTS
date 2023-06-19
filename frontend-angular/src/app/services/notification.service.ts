import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { IAccountEntity } from '../../../../interfaces';
import { MatDialog } from '@angular/material/dialog';
import { UtilityService } from './utility.service';
import { NotificationDrawerComponent } from '../components/dialogs/notification-drawer/notification-drawer.component';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  public notificationSettings: BehaviorSubject<NotificationSettings> = new BehaviorSubject<NotificationSettings>(JSON.parse(localStorage.getItem('notifySettings') ?? 'null') ?? { showNotification: true, closeAfter: 10000 });
  public notifications = new BehaviorSubject<Notification[]>([]);//live notifications only
  public onlineAccounts = new BehaviorSubject<IAccountEntity[] | undefined>(undefined);


  constructor(private dialog: MatDialog, private ut: UtilityService) { }

  openNotificationsDrawer() {
    this.dialog.open(NotificationDrawerComponent, { direction: this.ut.getDirection() });
  }

  unreadNotificationsCount(): number {
    return this.notifications.value.filter(v => v.shown == false).length;
  }
}

interface Notification {
  title: string,
  content: string,
  shown: boolean,
}
interface NotificationSettings {
  showNotification: boolean,
  closeAfter: number
}