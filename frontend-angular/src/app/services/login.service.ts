import { HttpClient, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UtilityService } from './utility.service';
import { Route } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  constructor(private http:HttpClient,private ut:UtilityService,) { }
  
  login(username:string,password:string){
    return this.http.post(this.ut.API+'login',{username,password}).subscribe((data: any) => {
      console.log('header:',data.header);
      console.log('data:',data);
      //if (data.success)
        //redirect to /main
      //else show the error dialog
    })
  }
}
