import { Injectable, OnDestroy, OnInit } from '@angular/core';
import { Socket, io } from 'socket.io-client';
import { environment } from 'src/environments/environment';
import { INotification, User } from '../../../../interfaces';
import { UtilityService } from './utility.service';
import { Subscription, filter, first } from 'rxjs';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root'
})
export class SocketService implements OnDestroy {
  private sub = new Subscription();
  private socket: Socket | undefined;
  /**
   * Notification will be passed to Admin and Parent:
   * - Admin:
   *  will receive all `POST/PATCH/PUT/DELETE methods`of `ALL entities` and `LOGIN/LOGOUT/BACKUP/RESTORE`.
   *  Notification structure: TITLE=`Account {{account.username}}`, CONTENT=`{{method:userFriendly}} {{entity}}. <span *ngIf="href">Click to see more information.</span>`
   * - Parent will receive `POST method` of `GOAL/EVALUATION entities`.
   *  Notification structure: TITLE=`{{ADMIN'S CONTENT}}`.
   *
   * NOTE: the server will handle the above condition and emit notification accordingly
   */
  constructor(private ut: UtilityService, private nt:NotificationService) {
  }
  public connect(v: User | null) {
    console.log('SocketService : connect : user:', v);

    // if (v == null) {
    //   if (this.socket)
    //     this.socket.close();

    // } else {
    //   if (this.socket)
    //     this.socket.close();
    //   this.socket = io(environment.SERVER_URL + 'notification');
    //   this.socket = this.socket.connect();
    //   this.socket.on('newNotification', this.newNotification);
    //   this.socket.emit('registerUser', v);
    // }
  }

  private newNotification = (n: INotification) => {
    console.log('newNotification', n);
    if (!n || !this.socket || this.ut.user.value == null || !this.nt.notificationSettings.value.showNotification)
      return;

    let title = this.getTitle(n, this.ut.user.value);
    let content = this.getContent(n, this.ut.user.value);
    let href = this.getHref(n, this.ut.user.value);
    if (title == null) {//parent will have title = null. So, swap title and content values to make text bigger
      title = content
      content = '';
    }
    let ref = this.nt.notify(title, content, 'info', this.nt.notificationSettings.value.closeAfter);
    if (href) {
      ref.onClick.subscribe(() => this.ut.router.navigateByUrl(href as string));
    }

  }

  private getTitle(n: INotification, user: User): string | null {
    if (user.roles.includes('Admin')) {
      return this.ut.translate('User') + ': ' + n.by.person.name;
    } return null;
  }

  private getContent(n: INotification, user: User): string {
    /**part1 looks like `created/deleted/edited`*/
    let part1: string;
    switch (n.method) {
      case 'POST': part1 = n.controller == 'login' ? '' : 'Created'; break;//login has POST method
      case 'DELETE': part1 = 'Deleted'; break;
      case 'PATCH': part1 = n.controller == 'account' ? '' : 'Edited'; break;//patch in account controller means UpdateOldPassword
      case 'PUT': part1 = 'Edited'; break;
      default: part1 = n.method ?? ''; break;
    }

    /**part2 looks like `account/goal/child/...` or `Downloaded a backup/Logged in/Logged out`*/
    let part2: string;
    switch (n.controller) {
      case 'login': part2 = 'Logged in into the system'; break;
      case 'logout': part2 = 'Logged out of the system'; break;
      case 'backup': part2 = 'Downloaded a backup file of the database'; break;
      case 'restore': part2 = 'Restored the database'; break;
      case 'account': part2 = this.getPartTwoOfAccount(n, user); break;//account name/username maybe provided
      case 'activity': part2 = 'an activity'; break;
      case 'child': part2 = 'a child'; break;
      case 'evaluation': part2 = this.getPartTwoOfEvaluation(n, user); break;//maybe parent
      case 'goal': part2 = this.getPartTwoOfGoal(n, user); break;//maybe parent
      case 'strength': part2 = this.getPartTwoOfStrength(n, user); break;
      case 'field': part2 = 'a field'; break;
      case 'program': part2 = 'a program'; break;
      default: part2 = this.ut.translate(n.controller); break;
    }
    let content = '';
    if (part1 && user.roles.includes('Admin'))
      content = this.ut.translate(part1) + ' ';
    content += this.ut.translate(part2);
    return content;
  }

  private getHref(n: INotification, user: User): string | undefined {
    if (n.payloadId &&
      (n.controller == 'child') &&
      n.method != 'DELETE') {
      return '/child/' + n.payloadId;//todo make child/account view information only
    } else if (n.payloadId &&
      n.controller == 'account' &&
      n.method != 'DELETE')
      return '/account/' + n.payloadId//todo append `n.controller == 'account'` then `return '/account/'+n.payloadId` or something like that.
    return undefined;
  }

  private getPartTwoOfAccount(n: INotification, user: User): string {
    let name = '';
    if (typeof n.payload?.person?.name == 'string') {
      name = n.payload.person.name;
    } else name = n.payload?.username;
    if (n.controller == 'account' && n.method == 'PATCH')
      return 'Changed his own password';//part1 is empty string
    if (name)
      return this.ut.translate('the following account') + ': ' + name;
    return 'an account';
  }

  private getPartTwoOfEvaluation(n: INotification, user: User): string {
    if (n.payload.person.name && n.method == 'POST')//parents only will have this payload
      return 'New evaluation created for child' + ' ' + n.payload.person.name;
    return 'an evaluation';
  }

  private getPartTwoOfGoal(n: INotification, user: User): string {
    if (n.payload.person.name && n.method == 'POST')//parents only will have this payload
      return 'New goal created for child' + ' ' + n.payload.person.name;
    return 'a goal';
  }

  private getPartTwoOfStrength(n: INotification, user: User): string {
    if (n.payload.person.name && n.method == 'POST')//parents only will have this payload
      return 'New strength created for child' + ' ' + n.payload.person.name;
    return 'a strength';
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
