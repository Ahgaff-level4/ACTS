import { Injectable } from '@angular/core';
import { Socket, io } from 'socket.io-client';
import { environment } from 'src/environments/environment';
import { INotification } from '../../../../interfaces';
import { UtilityService } from './utility.service';
import { Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket;

  constructor(private ut: UtilityService) {
    this.socket = io(environment.SERVER_URL + '/notification');
    this.socket = this.socket.connect()
  }

  public connect() {
    this.socket.emit("newNotification");
    this.socket.on('newNotification', this.newNotification);
    // this.socket.on('newNotification', (d) => console.log('newNotificaiton', d));
    // this.socket.emit("newNotification",1234)
    // this.socket.emit("newNotification",new Date())
    // this.socket.emit("newNotification",[{data:'asdf'}])
  }
  private newNotification = (notification: INotification) => {
    let user = notification.by;
    console.log('newNotification', notification);
    if (!notification || !this.ut.user.value)//todo|| user.accountId == this.ut.user.value.accountId)
      return;
    let title = this.ut.translate('Account') + ': ' + user.person.name;
    let action: string;
    switch (notification.method) {
      case 'POST': action = 'Created new'; break;
      case 'DELETE': action = 'Deleted'; break;
      case 'PATCH': action = 'Edited'; break;
      case 'PUT': action = 'Edited'; break;
      default: action = notification.method; break;
    }

    let entity: string;
    switch (notification.controller) {
      default: entity = notification.controller; break;
    }
    let content = this.ut.translate(action) + ' ' + this.ut.translate(entity);

    let href: undefined | string;
    if (notification.payloadId &&
      (notification.controller == 'child') &&
      notification.method != 'DELETE') {
      href = '/child/' + notification.payloadId + '/report';
      content += this.ut.translate('. Click to see the child information');
    }

    let ref = this.ut.notify(title, content, 'info', 10000);
    if (href) {
      ref.onClick.subscribe(() => this.ut.router.navigateByUrl(href as string));
    }

  }

}
