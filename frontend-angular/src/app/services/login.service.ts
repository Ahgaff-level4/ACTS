import { HttpClient, HttpErrorResponse, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UtilityService } from './utility.service';
import { Router } from '@angular/router';
import { environment as env } from 'src/environment';
import { ErrorResponse, SuccessResponse } from '../../../../interfaces';
@Injectable({
  providedIn: 'root'
})
export class LoginService {
  constructor(private http: HttpClient, private ut: UtilityService, private router: Router) { }

  login(username: string, password: string, isRememberMe: boolean) {
    this.http.post<SuccessResponse>(env.AUTH + 'login', { username, password, isRememberMe }).subscribe({
      next: (res) => {
        console.log('LoginService : login : this.http.post : res:', res);
        if (res.success && res.data.user) {
          this.ut.user.next(res.data.user);
          this.router.navigate(['main']);
        } else alert(res.data);
      }, error(e: HttpErrorResponse) {
        let error: ErrorResponse = e.error;
        alert(error?.message);
      }
    })
  }

  logout() {
    this.http.get<SuccessResponse>(env.AUTH + 'logout').subscribe({
      next: (res) => {
        if (res.success){
          this.ut.user.next(null)
          this.router.navigate(['login']);
        }
        //else //todo How to call error function here
      },error(e:HttpErrorResponse){
        console.log('LoginService : logout : e:', e);
        
        alert(e?.error?.message);
      }
    })
  }
}
