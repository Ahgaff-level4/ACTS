import { Injectable, TemplateRef, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ErrorResponse, IAccountEntity, SuccessResponse } from '../../../../interfaces';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { UtilityService } from './utility.service';
import { NotificationDrawerComponent } from '../components/dialogs/notification-drawer/notification-drawer.component';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { HttpErrorResponse } from '@angular/common/http';
import { ButtonType, MessageDialogComponent, MessageDialogData } from '../components/dialogs/message/message.component';
import { ComponentType } from '@angular/cdk/overlay';
import { HeaderActionsComponent } from '../components/static/header/header-actions/header-actions.component';
import { NotificationItemComponent } from '../components/dialogs/notification-drawer/notification-item/notification-item.component';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  /**
   * Notification Drawer will look like:
   * -------------------
   * + New Goal                                       a minute ago
   *   New goal was added to child Ahmad
   * -------------------
   * + New Evaluation                                 an hour ago
   *   New evaluation was added to goal blah blah of child Ahmad
   * --------------------
   */
  public notificationSettings: BehaviorSubject<NotificationSettings> = new BehaviorSubject<NotificationSettings>(JSON.parse(localStorage.getItem('notifySettings') ?? 'null') ?? { showNotification: true, closeAfter: 10000 });
  public notifications = new BehaviorSubject<NotificationShape[]>([
    {
      title: 'تقييم انضاف',
      content: 'تم إضافة تقييم',
      shown: false,
      timestamp: new Date(2023, 6, 19),
      link: '/child/101',
    },
    {
      title: 'هدف انضاف',
      content: 'تم إضافة هدف',
      shown: true,
      timestamp: new Date(),
      icon: 'success',
    },
  ]);//live notifications only
  public onlineAccounts = new BehaviorSubject<IAccountEntity[] | undefined>(undefined);

  /**will be initialize when notification-item initialized. and that will be initialize in the app component initialized.
   * app => notification-item => this.template
  */
  private template!: TemplateRef<NotificationShape>;

  constructor(private dialog: MatDialog, private ut: UtilityService, private nzNotification: NzNotificationService) { }

  /**append into `notifications` BehaviorSubject then emit & return the new values */
  public appendNewNotification(notification: NotificationShape): NotificationShape[] {
    const notifications = [...this.notifications.value, notification];
    this.notifications.next(notifications);
    return notifications;
  }
  /**
 * If title is null then show error message of something went wrong!
 * @param title will be translated
 * @param content will be translated
 * @param type  notification icon will be based on the type or 'undefined'/'blank' for no icon
 */
  public notify(title: string | null | undefined, content?: string, type?: 'success' | 'info' | 'warning' | 'error', duration: number = 40000) {
    if (title == null) {
      console.trace('notify title is `undefined`!');
      title = 'Error!';
      content = 'Something went wrong!';
      type = 'error';
    }
    const newNotify = { title:this.ut.translate(title), content: this.ut.translate(content) ?? '', icon:type, timestamp: new Date(), shown: false, };
    this.appendNewNotification(newNotify);
    const nzDuration = duration <= 0 ? undefined : duration;
    this.nzNotification.template(this.template, { nzData: newNotify, nzAnimate: true, nzDuration, nzClass: 'rounded-4 notify-' + this.ut.getDirection(), nzPlacement: 'bottomRight', nzPauseOnHover: true });
    return this.nzNotification.create(type ?? 'blank', newNotify.title, newNotify.content, { nzAnimate: true, nzDuration, nzClass: 'rounded-4 notify-' + this.ut.getDirection(), nzPlacement: 'bottomRight', nzPauseOnHover: true })
  }

  openNotificationsDrawer() {
    this.openDialog(NotificationDrawerComponent).afterClosed()
      .subscribe(() => this.notifications.next(this.notifications.value
        .map(v => ({ ...v, shown: true }))));
  }

  unreadNotificationsCount(): number {
    return this.notifications.value.filter(v => v.shown == false).length;
  }


  /**
   * Display error dialog with message of:
   * - if `HttpErrorResponse` then extract the error `message`.
   * - if string then message is `eOrMessage`.
   * - else show default message (e.g., 'Something Went Wrong!') followed by `appendMsg` if exist.
   * @param eOrMessage
   * @param appendMsg used when error could not be identified and will be appended after the default error message: `'Something Went Wrong! '+appendMsg`
   */
  public errorDefaultDialog = (eOrMessage?: HttpErrorResponse | string | ErrorResponse | SuccessResponse, appendMsg?: string): MatDialogRef<MessageDialogComponent, any> => {
    console.warn('UtilityService : errorDefaultDialog : eOrMessage:', eOrMessage);

    let message: string;
    if (typeof eOrMessage === 'string')
      message = eOrMessage;
    else if (eOrMessage instanceof HttpErrorResponse && eOrMessage?.error?.message)
      message = eOrMessage.error.message;
    else if (typeof (eOrMessage as ErrorResponse)?.success === 'boolean'
      && typeof (eOrMessage as ErrorResponse)?.message === 'string')
      message = eOrMessage?.message;
    else {
      let somethingWentWrong = this.ut.translate('Something went wrong!');
      appendMsg = appendMsg ? this.ut.translate(appendMsg) : '';
      let sorry = this.ut.translate('Sorry, there was a problem. Please try again later or check your connection.');
      message = (appendMsg ? appendMsg : somethingWentWrong + ' ' + sorry);
    }

    return this.showMsgDialog({ content: message, type: 'error' })
  }

  /**
   *
   * @param data structure of the message dialog
   * @returns MatDialogRef. Value when close is the button type clicked.
   */
  public showMsgDialog(data: MessageDialogData) {
    return this.openDialog<MessageDialogComponent,
      MessageDialogData,
      ButtonType>(MessageDialogComponent, data);
  }

  public openDialog<COMPONENT, PASS_DATA, RECEIVE_DATA>(component: ComponentType<COMPONENT>, data?: PASS_DATA) {
    return this.dialog.open<COMPONENT, PASS_DATA, RECEIVE_DATA>(component, { data, direction: this.ut.getDirection() })
  }

  /**Used by notification-item when initialized */
  public setTemplate(template: TemplateRef<any>) {
    this.template = template;
  }
}

export interface NotificationShape {
  title: string,
  content?: string,
  shown: boolean,
  /**href */
  link?: string,
  /**nzType */
  icon?: 'success'|'warning'|'error'|string,
  timestamp: Date,
}
interface NotificationSettings {
  showNotification: boolean,
  closeAfter: number
}