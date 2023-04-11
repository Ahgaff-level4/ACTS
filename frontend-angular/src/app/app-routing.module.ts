import { Injectable, NgModule, inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterModule, RouterStateSnapshot, Routes, UrlTree } from '@angular/router';
import { MainComponent } from './components/pages/main/main.component';
import { FieldComponent } from './components/pages/field/field.component';
import { LoginComponent } from './components/pages/login/login.component';
import { ProgramComponent } from './components/pages/program/program.component';
import { ChildrenComponent } from './components/pages/children/children/children.component';
import { AddEditChildComponent } from './components/pages/children/add-edit-child/add-edit-child.component';
import { Observable } from 'rxjs';
import { Role } from '../../../interfaces';
import { UtilityService } from './services/utility.service';
import { ActivityComponent } from './components/pages/activity/activity.component';

export async function RoleGuard(route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot) {
  const ut = inject(UtilityService);
  let allowRoles: Role[] = route.data['allowRoles'] as Role[];
  if (!Array.isArray(allowRoles) || allowRoles.length === 0)
    throw 'Expected allowRoles to be typeof Role[]. Got:' + allowRoles;
  if(ut.user.value == null){
    var isRememberMe: 'true' | 'false' = localStorage.getItem('isRememberMe') as 'true' | 'false';
    if (isRememberMe === 'true' && ut.user.value === null)
      await ut.isLogin();
  }
  for (let r of allowRoles)
    if (hasRole(r))
      return true;
  console.warn('canActivate : allowRoles=', allowRoles, ': userRoles=', ut.user.value?.roles)
  ut.showMsgDialog({
    type: 'info',
    title: 'Insufficient privilege!',
    content: `You don't have sufficient privilege to access this page!`
  });
  return false;


  function hasRole(role: Role) {
    return !!ut.user.value
      && ut.user.value.isLoggedIn
      && Array.isArray(ut.user.value.roles)
      && ut.user.value.roles.includes(role);
  }
}


const AH = { allowRoles: ['Admin', 'HeadOfDepartment'] };
const AHT = { allowRoles: ['Admin', 'HeadOfDepartment', 'Teacher'] };
const AHTP = { allowRoles: ['Admin', 'HeadOfDepartment', 'Teacher', 'Parent'] }
const titlePrefix = 'ACTS - ';

const routes: Routes = [
  { path: '', component: MainComponent, title: titlePrefix + 'Home', },
  { path: 'main', redirectTo: '' },
  { path: 'home', redirectTo: '' },
  { path: 'login', component: LoginComponent, title: titlePrefix + 'Login' },
  { path: 'field', component: FieldComponent, title: titlePrefix + 'Field', canActivate: [RoleGuard], data: AHT },
  { path: 'program', component: ProgramComponent, title: titlePrefix + 'Program', canActivate: [RoleGuard], data: AHT },
  { path: 'activities/:id', component: ActivityComponent, title: titlePrefix + 'Activities', canActivate: [RoleGuard], data: AHT },
  { path: 'children', component: ChildrenComponent, title: titlePrefix + 'Children', canActivate: [RoleGuard], data: AHTP },
  { path: 'add-child', component: AddEditChildComponent, title: titlePrefix + 'Add Child', canActivate: [RoleGuard], data: AH },
  { path: 'edit-child', component: AddEditChildComponent, title: titlePrefix + 'Edit Child', canActivate: [RoleGuard], data: AH },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }




