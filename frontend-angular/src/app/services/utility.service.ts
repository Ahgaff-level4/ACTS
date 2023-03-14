import { HttpClient, HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Role, SuccessResponse, User, ErrorResponse } from './../../../../interfaces.d';
import { BehaviorSubject } from 'rxjs';
import { environment as env } from 'src/environment';
import { TranslateService } from '@ngx-translate/core';
@Injectable({
  providedIn: 'root'
})
export class UtilityService {
  constructor(private http: HttpClient, private lang:TranslateService) {
    // this.http.get<SuccessResponse>(env.AUTH + 'isLogin').subscribe(res => {
    //   console.log('UtilityService : this.http.get : res:', res);
    //   if (res.success && res.data)
    //     this.user.next(res.data);
    // });
  }
  public user: BehaviorSubject<User | null> = new BehaviorSubject<User | null>(null);//null means not loggedIn and there is no user info

  /**
   * Display error dialog with message of:
   * - if HttpErrorResponse then extract the message.
   * - if string then message is eOrMessage.
   * - else show default message (e.g., 'Something Went Wrong!').
   * @param eOrMessage 
   */
  public async errorDefaultDialog(eOrMessage?: HttpErrorResponse | string | ErrorResponse|SuccessResponse):Promise<void> {
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
      message = await this.translate('somethingWentWrong')
    alert(message);//todo show dialog
  }
  
  /**
   * 
   * @param key (e.g., 'login' or 'somethingWentWrong')
   * @returns correspond translation of the key (e.g., 'Login' or 'تسجيل دخول')
   */
  public translate(key:string):Promise<string>{
    return new Promise((res,rej)=>{
      this.lang.get(key).subscribe({
        next:res,
        error:rej,
      });
    });
  }
}
