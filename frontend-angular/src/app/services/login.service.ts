import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment as env } from 'src/environments/environment';
import { SuccessResponse, User } from '../../../../interfaces';
import { PrivilegeService } from './privilege.service';
@Injectable({
  providedIn: 'root'
})
export class LoginService {
  constructor(private http: HttpClient, public pr: PrivilegeService, private router: Router) { }

    /**
   * promise that will return `User` if user is logged in into the server and has its own session in the server.
   * Also, this function will call `user.next(...)` accordingly.
   * Never rejected.
   */
    public isLogin = (): Promise<User | null> => {
      return new Promise<User | null>((resolve) => {
        this.http.get<User>(env.AUTH + 'isLogin').subscribe({
          next: res => {
            if (typeof res?.accountId === 'number' && Array.isArray(res?.roles)) {
              this.pr.user.next(res);
              resolve(res);
            } else {
              this.pr.user.next(null);
              resolve(null);
            }
          }, error: () => {
            this.pr.user.next(null);
            resolve(null);
          }
        });
      });
    }

  login(username: string, password: string, isRememberMe: boolean) {
    localStorage.setItem('isRememberMe', isRememberMe + '');
    return this.http.post<User>(env.AUTH + 'login', { username, password });

  }

  logout() {
    this.http.get<SuccessResponse>(env.AUTH + 'logout').subscribe({
      error: () => {
        this.pr.user.next(null);
        this.router.navigate(['login']);
      },
      complete: () => {
        this.pr.user.next(null);
        this.router.navigate(['login']);
      }
    });

  }
}
