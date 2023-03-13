import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Role, SuccessResponse, User } from './../../../../interfaces.d';
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
  public user: BehaviorSubject<User|null> = new BehaviorSubject<User|null>(null);//null means not loggedIn and there is no user info
}
