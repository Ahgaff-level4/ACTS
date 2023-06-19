import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { EMPTY, Observable, catchError } from 'rxjs';
import { UtilityService } from '../services/utility.service';
import { NotificationService } from '../services/notification.service';

@Injectable()
export class HttpCatchInterceptor implements HttpInterceptor {

  constructor(private ut: UtilityService, private nt:NotificationService,) { }

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
            this.ut.isLoading.next(false);
            this.showNetworkErrorDialog();
            return EMPTY;//call complete of the observable.
          } else if (error?.status === 401 && error.error?.action == 'login') {
            // if (this.ut.user.value)
            //   this.ut.user.next(null);

            this.showUnauthorizeDialog();

            this.ut.isLoading.next(false);
            return EMPTY;
          }
          // Rethrow the error
          throw error;
        }),

      );
    return obs;
  }

  showNetworkErrorDialog(){
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
        this.ut.router.navigateByUrl('login');
      // else this.ut.router.navigateByUrl('/')
    });
  }
}
