import { HttpClientModule } from '@angular/common/http';
import { Injectable } from '@angular/core';
@Injectable({
  providedIn: HttpClientModule
})
export class UtilityService {
  constructor() { }
  public readonly SERVER_URL = 'http://localhost:3000';
  public readonly API = this.SERVER_URL+'/api/';
}

export interface MyResponse{
  success:boolean;
  
}