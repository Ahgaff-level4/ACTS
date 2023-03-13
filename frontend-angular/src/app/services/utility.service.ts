import { HttpClient, HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Role, SuccessResponse, User, ErrorResponse } from './../../../../interfaces.d';
import { BehaviorSubject } from 'rxjs';
import { environment as env } from 'src/environment';
@Injectable({
  providedIn: 'root'
})
export class UtilityService {
  constructor(private http: HttpClient) {
    this.http.get<SuccessResponse>(env.AUTH + 'isLogin').subscribe(res => {
      console.log('UtilityService : this.http.get : res:', res);
      if (res.success && res.data)
        this.user.next(res.data);
    });
  }
  public user: BehaviorSubject<User | null> = new BehaviorSubject<User | null>(null);//null means not loggedIn and there is no user info

  /**
   * Display error dialog with message of:
   * - if HttpErrorResponse then extract the message.
   * - if string then message is eOrMessage.
   * - else show default message (e.g., 'Something Went Wrong!').
   * @param eOrMessage 
   */
  public errorDefaultDialog(eOrMessage?: HttpErrorResponse | string | ErrorResponse|SuccessResponse) {
    console.warn('UtilityService : errorDefaultDialog : eOrMessage:', eOrMessage);
    
    var message: string;
    if (typeof eOrMessage === 'string')
      message = eOrMessage;
    else if (eOrMessage instanceof HttpErrorResponse && eOrMessage?.error?.message)
      message = eOrMessage.error.message;
    else if (typeof (eOrMessage as ErrorResponse)?.success === 'boolean'
      && typeof (eOrMessage as ErrorResponse)?.message === 'string')
      message = eOrMessage?.message;
    else
      message = 'Something Went Wrong!';
    alert(message);//todo show dialog
  }
}
