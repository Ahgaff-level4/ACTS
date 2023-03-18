import { Injectable } from '@angular/core';
import { UtilityService } from '../services/utility.service';
import { Role } from '../../../../interfaces';
import { Subject, asyncScheduler, throttleTime } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GuardService {

  constructor(private ut: UtilityService) {
    this.subject
      .pipe(throttleTime(50, asyncScheduler, { leading: true, trailing: false }))
      .subscribe({
        next: () => this.ut.showMsgDialog({
          type: 'info',
          title: 'Insufficient privilege!',
          content: `You don't have sufficient privilege to access this page!`
        })
      });
  }

  public hasRole(role: Role) {
    console.log('user:',this.ut.user.value)
    return this.ut.user.value
      && this.ut.user.value.isLoggedIn
      && Array.isArray(this.ut.user.value.roles)
      && this.ut.user.value.roles.includes(role);
  }

  private subject = new Subject<void>();

  public showInsufficientDialog = () => {
    this.subject.next();
    /*
    This is because we have multiple guards that being called. 
    Thus if here we show the dialog it will be shown multiple times. 
    We used subject/observable and pipe it to throttleTime operator to handle this issue.
    */
  }
}
