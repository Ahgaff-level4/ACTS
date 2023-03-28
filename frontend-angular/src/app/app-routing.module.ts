import { Injectable, NgModule } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterModule, RouterStateSnapshot, Routes, UrlTree } from '@angular/router';
import { MainComponent } from './components/pages/main/main.component';
import { FieldComponent } from './components/pages/field/field.component';
import { LoginComponent } from './components/pages/login/login.component';
import { ProgramComponent } from './components/pages/program/program.component';
import { ChildrenComponent } from './components/pages/children/children.component';
import { AddChildComponent } from './components/pages/add-child/add-child.component';
import { AdminGuard } from './guards/onlyAdmin.guard';
import { TeacherGuard } from './guards/teacher.guard';
import { ParentGuard } from './guards/parent.guard';
import { Observable } from 'rxjs';
import { Role } from '../../../interfaces';
import { UtilityService } from './services/utility.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(private ut: UtilityService) { }
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    let allowRoles: Role[] = route.data['allowRoles'] as Role[];
    if (!Array.isArray(allowRoles) || allowRoles.length === 0)
      throw 'Expected allowRoles to be typeof Role[]. Got:' + allowRoles;
    for (let r of allowRoles)
      if (this.hasRole(r))
        return true;
    console.warn('canActivate : allowRoles=', allowRoles, ': userRoles=', this.ut.user.value?.roles)
    this.ut.showMsgDialog({
      type: 'info',
      title: 'Insufficient privilege!',
      content: `You don't have sufficient privilege to access this page!`
    });
    return false;
  }

  public hasRole = (role: Role) => {
    return !!this.ut.user.value
      && this.ut.user.value.isLoggedIn
      && Array.isArray(this.ut.user.value.roles)
      && this.ut.user.value.roles.includes(role);
  }

}
const titlePrefix = 'ACTS - ';
const AH = { allowRoles: ['Admin', 'HeadOfDepartment'] };
const AHT = { allowRoles: ['Admin', 'HeadOfDepartment', 'Teacher'] };
const AHTP = { allowRoles: ['Admin', 'HeadOfDepartment', 'Teacher', 'Parent'] }
const routes: Routes = [
  { path: '', component: MainComponent, title: titlePrefix + 'Home', },
  { path: 'main', component: MainComponent, title: titlePrefix + 'Home' },
  { path: 'home', component: MainComponent, title: titlePrefix + 'Home' },
  { path: 'login', component: LoginComponent, title: titlePrefix + 'Login' },
  { path: 'field', component: FieldComponent, title: titlePrefix + 'Field', canActivate: [RoleGuard], data: AHT },
  { path: 'program', component: ProgramComponent, title: titlePrefix + 'Program', canActivate: [RoleGuard], data: AHT },
  { path: 'children', component: ChildrenComponent, title: titlePrefix + 'Children', canActivate: [RoleGuard], data: AHTP },
  { path: 'add-child', component: AddChildComponent, title: titlePrefix + 'Add Child', canActivate: [RoleGuard], data: AH }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }




