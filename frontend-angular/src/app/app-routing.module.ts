import { NgModule, inject } from '@angular/core';
import { ActivatedRouteSnapshot, RouterModule, RouterStateSnapshot, Routes } from '@angular/router';
import { HomeComponent } from './components/pages/home/home.component';
import { FieldComponent } from './components/pages/field/field.component';
import { LoginComponent } from './components/pages/login/login.component';
import { ProgramComponent } from './components/pages/program/program.component';
import { ChildrenComponent } from './components/pages/children/children/children.component';
import { AddEditChildComponent } from './components/pages/children/add-edit-child/add-edit-child.component';
import { Subscription } from 'rxjs';
import { Role } from '../../../interfaces';
import { UtilityService } from './services/utility.service';
import { ActivityComponent } from './components/pages/activity/activity.component';
import { GoalComponent } from './components/pages/goal/goal.component';
import { AccountComponent } from './components/pages/accounts/account/account.component';
import { AddEditAccountComponent } from './components/pages/accounts/add-edit-account/add-edit-account.component';
import { Page404Component } from './components/pages/404/404.component';
import { SettingsComponent } from './components/pages/settings/settings.component';
import { EvaluationComponent } from './components/pages/evaluation/evaluation.component';
import { StrengthComponent } from './components/pages/strength/strength.component';
import { ButtonType, MessageDialogComponent } from './components/dialogs/message/message.component';
import { MatDialogRef } from '@angular/material/dialog';
import { SpecialActivityComponent } from './components/pages/special-activity/special-activity.component';
import { ReportChildComponent } from './components/pages/children/report-child/report-child.component';

export async function RoleGuard(route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot) {
  const ut = inject(UtilityService);
  let allowRoles: Role[] = route.data['allowRoles'] as Role[];
  if (!Array.isArray(allowRoles) || allowRoles.length === 0)
    throw 'Expected allowRoles to be typeof Role[]. Got:' + allowRoles;

  var dialog: MatDialogRef<MessageDialogComponent, ButtonType> | undefined = undefined;
  if (ut.user.value == null) {
    var isRememberMe: 'true' | 'false' = localStorage.getItem('isRememberMe') as 'true' | 'false';
    if (ut.user.value == null && isRememberMe !== 'false')
      ut.isLogin()//.finally(() => console.log('RoleGuard : isLogin:', ut.user.value));

    let sub: Subscription;
    sub = ut.user.subscribe((user) => {
      if (user) {
        dialog?.close();
        ut.router.navigateByUrl(state.url);
      }
      sub?.unsubscribe();
    });
  }

  for (let r of allowRoles)
    if (hasRole(r))
      return true;

  // console.warn('canActivate : allowRoles=', allowRoles, ': userRoles=', ut.user.value?.roles)
  showUnauthorizeDialog();
  return false;
  //----------------------------------------

  function showUnauthorizeDialog() {
    dialog = ut.showMsgDialog({
      type: 'error',
      title: { text: 'Insufficient privilege!' },
      content: `You don't have sufficient privilege to do this action!`,
      buttons: [{ color: 'primary', type: 'Login' }, { color: 'accent', type: 'Ok' },]
    })
    dialog.afterClosed().subscribe(v => {
      if (v === 'Login')
        ut.router.navigateByUrl('login');
      // else ut.router.navigateByUrl('/') If user is loggedIn then this dialog will be closed and navigated to the Unauthorize(was unauthorize) page. This line will navigate back to Home :/
    });
  }
  function hasRole(role: Role) {
    return !!ut.user.value
      && ut.user.value.isLoggedIn
      && Array.isArray(ut.user.value.roles)
      && ut.user.value.roles.includes(role);
  }
}


const A = { allowRoles: ['Admin'] };
const AH = { allowRoles: ['Admin', 'HeadOfDepartment'] };
const AHT = { allowRoles: ['Admin', 'HeadOfDepartment', 'Teacher'] };
const AHTP = { allowRoles: ['Admin', 'HeadOfDepartment', 'Teacher', 'Parent'] }
const titlePrefix = 'ACTS - ';

const routes: Routes = [
  { path: '', component: HomeComponent, title: titlePrefix + 'Home', pathMatch: 'full' },
  { path: 'main', redirectTo: '' },
  { path: 'home', redirectTo: '' },
  { path: 'login', component: LoginComponent, title: titlePrefix + 'Login' },
  { path: 'field', component: FieldComponent, title: titlePrefix + 'Field', canActivate: [RoleGuard], data: AHT },
  { path: 'program', component: ProgramComponent, title: titlePrefix + 'Program', canActivate: [RoleGuard], data: AHT },
  { path: 'account', component: AccountComponent, title: titlePrefix + 'Account', canActivate: [RoleGuard], data: A },
  { path: 'add-account', component: AddEditAccountComponent, title: titlePrefix + 'Add Account', canActivate: [RoleGuard], data: A },
  { path: 'edit-account', component: AddEditAccountComponent, title: titlePrefix + 'Edit Account', canActivate: [RoleGuard], data: A },
  { path: 'program/:id/activities', component: ActivityComponent, title: titlePrefix + 'Activities', canActivate: [RoleGuard], data: AHT },
  { path: 'children', component: ChildrenComponent, title: titlePrefix + 'Children', canActivate: [RoleGuard], data: AHTP },
  { path: 'add-child', component: AddEditChildComponent, title: titlePrefix + 'Add Child', canActivate: [RoleGuard], data: AH },
  { path: 'edit-child', component: AddEditChildComponent, title: titlePrefix + 'Edit Child', canActivate: [RoleGuard], data: AH },
  { path: 'child/:id/goals', component: GoalComponent, title: titlePrefix + 'Goals', canActivate: [RoleGuard], data: AHTP },
  { path: 'goal/:id/evaluations', component: EvaluationComponent, title: titlePrefix + 'Evaluations', canActivate: [RoleGuard], data: AHTP },
  { path: 'child/:id/strengths', component: StrengthComponent, title: titlePrefix + 'Strengths', canActivate: [RoleGuard], data: AHTP },
  { path: 'special-activities', component: SpecialActivityComponent, title: titlePrefix + 'Special Activities', canActivate: [RoleGuard], data: AH },
  { path: 'settings', component: SettingsComponent, title: titlePrefix + 'Settings', },
  { path: 'child/:id/report', component: ReportChildComponent, title: titlePrefix + 'Child Report', canActivate: [RoleGuard], data: AH },
  { path: '**', component: Page404Component, title: 'Page Not Found' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }




