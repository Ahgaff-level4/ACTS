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

  login(username: string, password: string, isRememberMe: boolean) {
    localStorage.setItem('isRememberMe', isRememberMe + '');
    return this.http.post<User>(env.AUTH + 'login', { username, password });

  }

  logout() {
    
    this.http.get<SuccessResponse>(env.AUTH + 'logout').subscribe({
      error: () => {
        this.ut.user.next(null);
        this.router.navigate(['login']);
      },
      complete: () => {
        this.ut.user.next(null);
        this.router.navigate(['login']);
      }
    });

  }
}
