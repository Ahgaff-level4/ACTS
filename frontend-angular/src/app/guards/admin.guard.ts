import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { UtilityService } from '../services/utility.service';
import { GuardService } from './guard.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(private guardService: GuardService) { }
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (this.guardService.hasRole('Admin'))
      return true;
    console.log('AdminGuard : canActivate:', false);

    this.guardService.showInsufficientDialog();
    return false;
  }

}
