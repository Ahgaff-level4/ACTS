import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { UtilityService } from '../services/utility.service';

@Injectable({
  providedIn: 'root'
})
export class HeadOfDepartmentGuard implements CanActivate {
  constructor(private ut:UtilityService){}
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      if (this.ut.user.value
        && this.ut.user.value.isLoggedIn
        && Array.isArray(this.ut.user.value.roles)
        && this.ut.user.value.roles.includes('Admin')) {
        return true;
      }
      
      this.ut.showMsgDialog({type:'info',title:'Insufficient privilege!',content:`You don't have sufficient privilege to access this page!`})
      return false;
  }
  
}
