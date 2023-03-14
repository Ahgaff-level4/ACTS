import { HttpClient, HttpErrorResponse, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UtilityService } from './utility.service';
import { Router } from '@angular/router';
import { environment as env } from 'src/environment';
import { ErrorResponse, SuccessResponse, User } from '../../../../interfaces';
import { TranslateService } from '@ngx-translate/core';
@Injectable({
  providedIn: 'root'
})
export class LoginService {
  constructor(private http: HttpClient, private ut: UtilityService, private router: Router) { }

  login(username: string, password: string, isRememberMe: boolean) {
    this.http.post<User>(env.AUTH + 'login', { username, password, isRememberMe }).subscribe({
      next: (res) => {
        console.log('LoginService : login : this.http.post : res:', res);
        if (typeof res.accountId === 'number' && typeof res.isLoggedIn === 'boolean' && Array.isArray(res.roles)) {
          this.ut.user.next(res);
          this.router.navigate(['main']);
        } else this.ut.errorDefaultDialog();
      }, error: this.ut.errorDefaultDialog
    })
  }

  logout() {
    this.http.get<SuccessResponse>(env.AUTH + 'logout').subscribe({
      next: (res) => {
        if (res.success) {
          this.ut.user.next(null)
          this.router.navigate(['login']);
        } else this.ut.errorDefaultDialog(res);
      }, error: this.ut.errorDefaultDialog
    })
  }
}
