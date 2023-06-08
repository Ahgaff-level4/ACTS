import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpClient, HttpErrorResponse, HttpResponse, HttpBackend } from '@angular/common/http';
import { EMPTY, Observable, catchError, delay, from, mergeMap, of, retry, retryWhen, take, tap, throwError } from 'rxjs';
import { UtilityService } from '../services/utility.service';
import { LoginService } from '../services/login.service';

@Injectable()
export class HttpCatchInterceptor implements HttpInterceptor {

  constructor(private ut: UtilityService, private http: HttpClient) { }

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
            throw error;//call complete of the observable.
          } else if (error?.status === 401 && error.error?.action == 'login') {
            // if (this.ut.user.value)
            //   this.ut.user.next(null);

            this.showUnauthorizeDialog();

            this.ut.isLoading.next(false);
            throw error;
          }
          // Rethrow the error
          throw error;
        }),

      );
    return obs;
  }

  showNetworkErrorDialog(){
      this.ut.notify('Network Error!', `Please check your network connection and try again.`, 'error');
  }

  showUnauthorizeDialog() {
    this.ut.showMsgDialog({
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
