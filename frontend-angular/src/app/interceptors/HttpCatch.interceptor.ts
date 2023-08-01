import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { EMPTY, Observable, catchError } from 'rxjs';
import { NotificationService } from '../services/notification.service';
import { DisplayService } from '../services/display.service';
import { Router } from '@angular/router';

@Injectable()
export class HttpCatchInterceptor implements HttpInterceptor {

  constructor(private display: DisplayService, private nt: NotificationService, private router: Router,) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<any> {
    const requestClone = req.clone();

    const obs = next.handle(req)
      .pipe(
        catchError(async (error: HttpErrorResponse, caught) => {
          console.log('interceptor caught an error', error);
          if (req.url.includes('api/auth/isLogin'))//this url to check login status. It will send even if user is only visitor. So, don't show Unauthorize dialog
            throw error;
          // Check the status and handle the error accordingly
          if (error?.status === 0 || error?.status === -1) {
            this.display.isLoading.next(false);
            this.showNetworkErrorDialog();
            return EMPTY;//call complete of the observable.
          } else if (error?.status === 401 && error.error?.action == 'login') {
            // if (this.pr.user.value)
            //   this.pr.user.next(null);

            this.showUnauthorizeDialog();

            this.display.isLoading.next(false);
            return EMPTY;
          }
          // Rethrow the error
          throw error;
        }),

      );
    return obs;
  }

  showNetworkErrorDialog() {
    this.nt.notify('Network Error!', `Please check your network connection and try again.`, 'error');
  }

  showUnauthorizeDialog() {
    this.nt.showMsgDialog({
      type: 'error',
      title: { text: 'Insufficient privilege!' },
      content: `You don't have sufficient privilege to do this action!`,
      buttons: [{ color: 'primary', type: 'Login' }, { color: 'accent', type: 'Ok' },]
    }).afterClosed().subscribe(v => {
      if (v === 'Login')
        this.router.navigateByUrl('login');
      // else this.router.navigateByUrl('/')
    });
  }
}
