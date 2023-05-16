import { HttpClient, HttpErrorResponse, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UtilityService } from './utility.service';
import { Router } from '@angular/router';
import { environment as env } from 'src/environments/environment';
import { ErrorResponse, SuccessResponse, User } from '../../../../interfaces';
@Injectable({
  providedIn: 'root'
})
export class LoginService {
  constructor(private http: HttpClient, private ut: UtilityService, private router: Router) { }

  login(username: string, password: string, isRememberMe: boolean,onDone:Function) {
    localStorage.setItem('isRememberMe', isRememberMe + '');
    return this.http.post<User>(env.AUTH + 'login', { username, password }).subscribe({
      next: (res) => {
        if (typeof res.accountId === 'number' && Array.isArray(res.roles)) {
          this.ut.user.next(res);
          onDone();
        } else this.ut.errorDefaultDialog();
      }, error:(e)=>{
        onDone();
        this.ut.errorDefaultDialog(e);
      }
    });

  }

  logout() {
    this.http.get<SuccessResponse>(env.AUTH + 'logout').subscribe({
      next: (res) => {
        if (res.success) {
          this.ut.user.next(null)
          this.router.navigate(['login']);
        } else this.ut.errorDefaultDialog(res);
      }, error: (e) => {
        this.ut.errorDefaultDialog(e);
        this.ut.user.next(null)
      }
    })
  }
}
