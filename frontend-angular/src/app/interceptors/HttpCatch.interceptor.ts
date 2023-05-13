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
          console.log('interceptor called', error);
          if (req.url.includes('api/auth/isLogin'))//this url to check login status. It will send even if user is only visitor. So, don't show Unauthorize dialog
            throw error;
          // Check the status and handle the error accordingly
          if (error?.status === 0 || error?.status === -1) {
            this.ut.isLoading.next(false);
            const isResend = await this.showNetworkErrorDialog();
            // if (isResend) {
            //   this.ut.isLoading.next(true);
            //   return this.http.request(requestClone).pipe(
            //     tap((o) => this.ut.isLoading.next(false))
            //   );
            // } else
            return EMPTY;
          } else if (error?.status === 401 && error.error?.action == 'login') {
            if (this.ut.user.value)
              this.ut.user.next(null);

            this.showUnauthorizeDialog();

            this.ut.isLoading.next(false);
            return EMPTY;
          }
          // Rethrow the error
          throw error;
          // return throwError(() => {
          //   (error as any).passedByHttpInterceptor = true;
          //   return error;
          // });
        }),

      );
    // obs.subscribe({
    //   next: (v) => console.log('interceptor next', v),
    //   error: (e) => console.log('interceptor error', e)
    // });
    return obs;
  }



  /**
   *
   * @returns Promise that will resolve -when dialog closed- with true only if user click `Resend`. False otherwise
   */
  showNetworkErrorDialog(): Promise<boolean> {
    return new Promise((res) => {
      this.ut.showMsgDialog({
        type: 'error',
        title: { text: 'Network Error!' },
        content: `Please check your network connection and try again.`,
        // buttons: [{ color: 'primary', type: 'Resend' }, { color: 'accent', type: 'Cancel' },]
      })
      // .afterClosed().subscribe(v => {
      //   if (v === 'Resend')
      //     return res(true);
      //   else this.ut.router.navigateByUrl('/');
      //   return res(false);
      // });
    })
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
      else this.ut.router.navigateByUrl('/')
    });
  }
}
