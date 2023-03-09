import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Role, SuccessResponse, User } from './../../../../interfaces.d';
import { BehaviorSubject } from 'rxjs';
@Injectable({
  providedIn: HttpClientModule
})
export class UtilityService {
  constructor(private http: HttpClient) {
    this.http.get(this.API + 'isLogin').subscribe((res: any) => {
      console.log('UtilityService : this.http.get : res:', res);
      
      if ((res as SuccessResponse).data) {
        let data: User = res.data;
        this.user.next({
          ...data
        })
      } else this.user.next({ isLoggedIn: false, roles: [], accountId: -1, name: '' })
    })
  }
  
  public user!: BehaviorSubject<User>;

  public readonly SERVER_URL = 'http://localhost:3000';
  public readonly API = this.SERVER_URL + '/api/';
}
