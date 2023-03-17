import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { UtilityService } from '../services/utility.service';
import { GuardService } from './guard.service';

@Injectable({
  providedIn: 'root'
})
export class ParentGuard implements CanActivate {
  constructor(private guardService: GuardService) { }
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (this.guardService.hasRole('Parent'))
      return true;

    console.log('ParentGuard : canActivate:', false);
    this.guardService.showInsufficientDialog();
    return false;
  }

}
