import { Injectable, TemplateRef } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ErrorResponse, SuccessResponse, User } from '../../../../interfaces';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { UtilityService } from './utility.service';
import { NotificationDrawerComponent } from '../components/dialogs/notification-drawer/notification-drawer.component';
import { NzNotificationRef, NzNotificationService } from 'ng-zorro-antd/notification';
import { HttpErrorResponse } from '@angular/common/http';
import { ButtonType, MessageDialogComponent, MessageDialogData } from '../components/dialogs/message/message.component';
import { ComponentType } from '@angular/cdk/overlay';
import { SelectActivityComponent } from '../components/dialogs/select-activity/select-activity.component';
import { AddParentComponent } from '../components/dialogs/add-edit/add-parent/add-parent.component';

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
  public notifications = new BehaviorSubject<NotificationShape[]>([]);//live notifications only
  public onlineAccounts = new BehaviorSubject<OnlineAccount[] | undefined>(undefined);

  /**will be initialize when notification-item initialized. and that will be initialize in the app component initialized.
   * app => notification-item => this.template
  */
  private template!: TemplateRef<NotificationShape>;

  constructor(private dialog: MatDialog, private ut: UtilityService, private nzNotification: NzNotificationService) { }

  /**append into `notifications` BehaviorSubject then emit & return the new values */
  private appendNewNotification(notification: NotificationShape): NotificationShape[] {
    const notifications = [...this.notifications.value, notification];
    this.notifications.next(notifications);
    return notifications;
  }

  /**
   * Will call notify and append the provided notification to nt.notifications so that it shows on notification drawer.
   * @param title can be array to translate each item. Note: it will be joined without space, add space as an array element.
   * @param content can be array as `title`
   * @param icon SHOULD be provided in the app.module icons array, the color is set by the `class` property (e.g. 'text-success','my-primary-text')
   */

  public pushNotification(title: string[] | string, content?: string | string[], icon?: NotificationIcon, link?: NotificationLink): NzNotificationRef {
    let translatedTitle = ''
    if (Array.isArray(title))
      for (let str of title)
        translatedTitle += this.ut.translate(str);
    else translatedTitle = this.ut.translate(title);
    let translatedContent = '';
    if (Array.isArray(content))
      for (let str of content)
        translatedContent += this.ut.translate(str);
    else translatedContent = this.ut.translate(content);

    const newNotify = { title: translatedTitle, content: translatedContent ?? '', icon, link, timestamp: new Date(), shown: false, };
    this.appendNewNotification(newNotify);

    return this.nzNotification.template(this.template, { nzData: newNotify, nzAnimate: true, nzDuration: this.notificationSettings.value.closeAfter, nzClass: 'rounded-4 notify-' + this.ut.getDirection(), nzPlacement: 'bottomRight', nzPauseOnHover: true });
  }
  /**
 * If title is null then show error message of something went wrong!
 * @param title will be translated. null/undefined will be 'Error! Something went wrong' message.
 * @param content will be translated
 * @param type  notification icon will be based on the type or 'undefined'/'blank' for no icon
 */
  public notify(title: string | string[] | null | undefined, content?: string | string[], type?: 'success' | 'info' | 'warning' | 'error', duration: number = 4000): NzNotificationRef {
    if (title == null) {
      console.trace('notify title is `undefined`!');
      title = 'Error!';
      content = 'Something went wrong!';
      type = 'error';
    }
    let translatedTitle = '';
    if (Array.isArray(title))
      for (let str of title)
        translatedTitle += this.ut.translate(str);
    else translatedTitle = this.ut.translate(title);
    let translatedContent = '';
    if (Array.isArray(content))
      for (let str of content)
        translatedContent += this.ut.translate(str);
    else translatedContent = this.ut.translate(content)
    const newNotify = { title: translatedTitle, content: translatedContent ?? '', icon: type, timestamp: new Date(), shown: false, };
    const nzDuration = duration <= 0 ? undefined : duration;
    return this.nzNotification.template(this.template, { nzData: newNotify, nzAnimate: true, nzDuration, nzClass: 'rounded-4 notify-' + this.ut.getDirection(), nzPlacement: 'bottomRight', nzPauseOnHover: true })
  }

  public openNotificationsDrawer() {
    this.openDialog(NotificationDrawerComponent).afterClosed()
      .subscribe(() => this.notifications.next(this.notifications.value
        .map(v => ({ ...v, shown: true }))));
  }

  public unreadNotificationsCount(): number {
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

    return this.showMsgDialog({ content: this.ut.translate(message), type: 'error' })
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
    let width = '500px'
    if (component.name == SelectActivityComponent.name)//activity name won't be shown all in 500px width
      width = '90%';
    else if (component.name == AddParentComponent.name)
      width = '95%';
    return this.dialog.open<COMPONENT, PASS_DATA, RECEIVE_DATA>(component, { data, direction: this.ut.getDirection(), width })
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
  link?: NotificationLink;
  /**nzType */
  icon?: NotificationIcon,
  timestamp: Date,
}
export type NotificationLink = { btnText?: string, href: string };
export type NotificationIcon = 'success' | 'warning' | 'error' | 'info' | { nzType: string, class: string };
interface NotificationSettings {
  showNotification: boolean,
  closeAfter: number
}
export type OnlineAccount = User & { timestamp: string };