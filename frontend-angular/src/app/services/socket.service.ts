import { Injectable, OnDestroy, OnInit } from '@angular/core';
import { Socket, io } from 'socket.io-client';
import { environment } from 'src/environments/environment';
import { IAccountEntity, INotification, User } from '../../../../interfaces';
import { UtilityService } from './utility.service';
import { Subscription, filter, first } from 'rxjs';
import { NotificationIcon, NotificationLink, NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root'
})
export class SocketService implements OnDestroy {
  private sub = new Subscription();
  private socket: Socket | undefined;
  private user: User | undefined;
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
  constructor(private ut: UtilityService, private nt: NotificationService) {
  }
  public connect(v: User | null) {
    console.log('SocketService : connect : user:', v);

    if (v == null) {
      if (this.socket)
        this.socket.close();

    } else {
      if (this.user && v.accountId == this.user.accountId)
        return;
      else if (this.socket)
        this.socket.close();
      this.user = v;
      this.socket = io(environment.SERVER_URL + 'notification');
      this.socket = this.socket.connect();
      this.socket.on('newNotification', this.newNotification);
      this.socket.emit('registerUser', v);
      this.socket.on('onlineAccounts', (v: (IAccountEntity & { socketId: string,timestamp:string })[]) => {
        this.nt.onlineAccounts.next(v);
        console.log('onlineAccounts', v);
      })
    }
  }

  private newNotification = (n: INotification) => {
    console.log('newNotification', n);
    if (!n || this.ut.user.value == null || !this.nt.notificationSettings.value.showNotification)
      return;

    let title = this.getTitle(n);
    let content = this.getContent(n, this.ut.user.value);
    if (title == null) {//if title = null then swap title and content values to make text bigger
      title = content
      content = '';
    }
    let icon = this.getIcon(n);
    let link = this.getHref(n);
    this.nt.pushNotification(title, content, icon, link);
  }

  private getTitle(n: INotification): string | null {
    return this.ut.translate('account') + ': ' + n.by.person.name;
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
      case 'child': part2 = 'a child' + ' ' + n.payload?.person?.name ?? ''; break;
      case 'evaluation': part2 = this.getPartTwoOfEvaluation(n); break;//maybe parent
      case 'goal': part2 = this.getPartTwoOfGoal(n); break;//maybe parent
      case 'strength': part2 = this.getPartTwoOfStrength(n); break;
      case 'field': part2 = this.ut.translate('a field') + ' ' + n.payload?.name ?? ''; break;
      case 'program': part2 = this.ut.translate('a program') + ' ' + n.payload?.name ?? ''; break;
      default: part2 = this.ut.translate(n.controller); break;
    }
    let content = '';
    if (part1 && user.roles.includes('Admin'))
      content = this.ut.translate(part1) + ' ';
    content += this.ut.translate(part2);
    return content;
  }

  private getIcon(n: INotification,): NotificationIcon {
    let nzType, className;
    switch (n.method) {
      case 'POST': n.controller == 'login' ? (nzType = 'login') : (nzType = 'plus-circle'); break;//login has POST method
      case 'DELETE': nzType = 'delete'; break;
      case 'PATCH': (nzType = 'edit'); break;//patch in account controller means UpdateOldPassword
      case 'PUT': (nzType = 'edit'); break;
      default: (nzType = 'info-circle'); break;
    }
    return { nzType, class: className ?? 'text-info' };
  }

  private getHref(n: INotification,): NotificationLink | undefined {
    if (n.payloadId) {
      if ((n.controller == 'child') &&
        n.method != 'DELETE') {
        return { href: '/child/' + n.payloadId };//todo make child/account view information only
      } else if (n.controller == 'account' &&
        n.method != 'DELETE')
        return { href: '/account/' + n.payloadId };//todo append `n.controller == 'account'` then `return '/account/'+n.payloadId` or something like that.
      else if (n.controller == 'program')
        return { btnText: this.ut.translate('View') + ' ' + this.ut.translate('Programs'), href: '/program' }
      else if (n.controller == 'field')
        return { btnText: this.ut.translate('View') + ' ' + this.ut.translate('Fields'), href: '/field' }
    }
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

  private getPartTwoOfEvaluation(n: INotification): string {
    if (n.payload.person.name && n.method == 'POST')//parents only will have this payload
      return 'New evaluation created for child' + ' ' + n.payload.person.name;
    return 'an evaluation';
  }

  private getPartTwoOfGoal(n: INotification): string {
    if (n.payload.person.name && n.method == 'POST')//parents only will have this payload
      return 'New goal created for child' + ' ' + n.payload.person.name;
    return 'a goal';
  }

  private getPartTwoOfStrength(n: INotification): string {
    if (n.payload.person.name && n.method == 'POST')//parents only will have this payload
      return 'New strength created for child' + ' ' + n.payload.person.name;
    return 'a strength';
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
