import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MessageDialogComponent, MessageDialogData } from '../components/dialogs/message/message.component';
import { UtilityService } from '../services/utility.service';
import { Role } from '../../../../interfaces';
import { AsyncSubject, Observable, Subject, Subscriber, asyncScheduler, bindCallback, debounceTime } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GuardService {

  constructor(private ut: UtilityService) {
    this.observable.subscribe({
      next: () => this.ut.showMsgDialog({
        type: 'info',
        title: 'Insufficient privilege!',
        content: `You don't have sufficient privilege to access this page!`
      })
    });
  }

  public hasRole(role: Role) {
    return this.ut.user.value
      && this.ut.user.value.isLoggedIn
      && Array.isArray(this.ut.user.value.roles)
      && this.ut.user.value.roles.includes(role);
  }

  private observable = new Observable((s) => {
    this.subscriber = s;
  }).pipe(debounceTime(100));

  private subscriber!: Subscriber<unknown>;



  public showInsufficientDialog = () => {
    this.subscriber?.next();
    /*
    This is because we have multiple guards that being called. 
    Thus if here we show the dialog it will be shown multiple times. 
    We used observable and debounceTime operator to handle this issue.
    */
  }
}
