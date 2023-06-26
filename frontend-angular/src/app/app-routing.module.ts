import { NgModule, inject } from '@angular/core';
import { ActivatedRouteSnapshot, RouterModule, RouterStateSnapshot, Routes } from '@angular/router';
import { HomeComponent } from './components/pages/home/home.component';
import { FieldComponent } from './components/pages/field/field.component';
import { LoginComponent } from './components/pages/login/login.component';
import { ProgramComponent } from './components/pages/program/program.component';
import { ChildrenComponent } from './components/pages/children/children/children.component';
import { AddEditChildComponent } from './components/pages/children/add-edit-child/add-edit-child.component';
import { Role, User } from '../../../interfaces';
import { UtilityService } from './services/utility.service';
import { ActivityComponent } from './components/pages/activity/activity.component';
import { GoalComponent } from './components/pages/goal/goal.component';
import { AccountComponent } from './components/pages/accounts/account/account.component';
import { AddEditAccountComponent } from './components/pages/accounts/add-edit-account/add-edit-account.component';
import { Page404Component } from './components/pages/404/404.component';
import { SettingsComponent } from './components/pages/settings/settings.component';
import { EvaluationComponent } from './components/pages/evaluation/evaluation.component';
import { StrengthComponent } from './components/pages/strength/strength.component';
import { SpecialActivityComponent } from './components/pages/special-activity/special-activity.component';
import { ReportChildComponent } from './components/pages/children/report-child/report-child.component';
import { Component } from 'ag-grid-community';
import { ViewChildComponent } from './components/pages/children/view-child/view-child.component';
import { ViewAccountComponent } from './components/pages/accounts/view-account/view-account.component';
import { PRIVILEGES } from './services/privilege.service';
import { NotificationService } from './services/notification.service';
import { AboutUsComponent } from './components/pages/about-us/about.component';
import { LoginService } from './services/login.service';

export interface ComponentCanDeactivate {
  /**@returns false to prevent user navigating. true otherwise */
  canDeactivate: () => boolean
}

function isComponentCanDeactivate(arg: any): arg is ComponentCanDeactivate {
  return (arg as ComponentCanDeactivate).canDeactivate !== undefined;
}

export function PendingChangesGuard(component: Component, state: RouterStateSnapshot) {
  // if there are no pending changes, just allow deactivation; else confirm first
  if (isComponentCanDeactivate(component)) {//same as (component instanceof ComponentCanDeactivate)
    // NOTE: this warning message will only be shown when navigating elsewhere within your angular app;
    // when navigating away from your angular app, the browser will show a generic warning message
    // see http://stackoverflow.com/a/42207299/7307355
    if (component.canDeactivate())
      return true
    else {
      const ut = inject(UtilityService);
      return confirm(ut.translate('Changes you made may not be saved.'));
    }
  }
  return true;
}


export async function RoleGuard(route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot) {
  const ut = inject(UtilityService);
  const nt = inject(NotificationService);
  const loginService = inject(LoginService);
  let allowRoles: Role[] = route.data['allowRoles'] as Role[];
  if (!Array.isArray(allowRoles) || allowRoles.length === 0)
    throw 'Expected allowRoles to be typeof Role[]. Got:' + allowRoles;
  var user: User;
  if (loginService.pr.user.value == null) {
    var isRememberMe: 'true' | 'false' = localStorage.getItem('isRememberMe') as 'true' | 'false';
    if (isRememberMe != 'false') {//try re-login if user session in the server still alive
      let isLogin = await loginService.isLogin();
      if (isLogin == null) {//show error dialog if user's session is not alive with the server
        showUnauthorizeDialog();
        return false;
      } else user = isLogin;
    } else {//show error dialog if user set `isRememberMe` to false
      showUnauthorizeDialog();
      return false;
    }
  } else user = loginService.pr.user.value;

  for (let r of allowRoles)
    if (hasRole(user, r))
      return true;

  showUnauthorizeDialog();
  return false;
  //----------------------------------------

  function showUnauthorizeDialog() {
    nt.showMsgDialog({
      type: 'error',
      title: { text: 'Insufficient privilege!' },
      content: `You don't have sufficient privilege to do this action!`,
      buttons: [{ color: 'primary', type: 'Login' }, { color: 'accent', type: 'Ok' },]
    }).afterClosed().subscribe(v => {
      if (v === 'Login')
        ut.router.navigateByUrl('login');
      // else ut.router.navigateByUrl('/') If user is loggedIn then this dialog will be closed and navigated to the Unauthorize(was unauthorize) page. This line will navigate back to Home :/
    });
  }

  function hasRole(user: User, role: Role) {
    return !!user
      && Array.isArray(user.roles)
      && user.roles.includes(role);
  }
}


const titlePrefix = 'ACTS - ';
export const routes: Routes = [
  { path: '', component: HomeComponent, title: titlePrefix + 'Home', pathMatch: 'full', data: { animation: 'homePage' } },
  { path: 'main', redirectTo: '/' },
  { path: 'home', redirectTo: '/' },
  { path: 'index', redirectTo: '/' },
  { path: 'login', component: LoginComponent, title: titlePrefix + 'Login', data: { animation: 'loginPage' } },
  { path: 'field', component: FieldComponent, title: titlePrefix + 'Field', canActivate: [RoleGuard], data: { allowRoles: PRIVILEGES.fieldsPage, animation: 'fieldPage' } },
  { path: 'program', component: ProgramComponent, title: titlePrefix + 'Program', canActivate: [RoleGuard], data: { allowRoles: PRIVILEGES.programsPage, animation: 'programPage' } },
  { path: 'account', component: AccountComponent, title: titlePrefix + 'Account', canActivate: [RoleGuard], data: { allowRoles: PRIVILEGES.accountsPage, animation: 'accountPage' } },
  { path: 'account/:id', component: ViewAccountComponent, title: titlePrefix + 'Account info', canActivate: [RoleGuard], data: { allowRoles: PRIVILEGES.viewAccountPage, animation: 'viewAccountPage' } },
  { path: 'add-account', component: AddEditAccountComponent, title: titlePrefix + 'Add Account', canDeactivate: [PendingChangesGuard], canActivate: [RoleGuard], data: { allowRoles: PRIVILEGES.addAccountPage, animation: 'addAccountPage' } },
  { path: 'edit-account', component: AddEditAccountComponent, title: titlePrefix + 'Edit Account', canDeactivate: [PendingChangesGuard], canActivate: [RoleGuard], data: { allowRoles: PRIVILEGES.editAccountPage, animation: 'editAccountPage' } },
  { path: ':programOrField/:id/activities', component: ActivityComponent, title: titlePrefix + 'Activities', canActivate: [RoleGuard], data: { allowRoles: PRIVILEGES.activitiesPage, animation: 'activitiesPage' } },
  { path: 'children', component: ChildrenComponent, title: titlePrefix + 'Children', canActivate: [RoleGuard], data: { allowRoles: PRIVILEGES.childrenPage, animation: 'childrenPage' } },
  { path: 'add-child', component: AddEditChildComponent, title: titlePrefix + 'Add Child', canDeactivate: [PendingChangesGuard], canActivate: [RoleGuard], data: { allowRoles: PRIVILEGES.addChildPage, animation: 'addChildPage' } },
  { path: 'edit-child', component: AddEditChildComponent, title: titlePrefix + 'Edit Child', canDeactivate: [PendingChangesGuard], canActivate: [RoleGuard], data: { allowRoles: PRIVILEGES.editChildPage, animation: 'editChildPage' } },
  { path: 'child/:id/goals', component: GoalComponent, title: titlePrefix + 'Goals', canActivate: [RoleGuard], data: { allowRoles: PRIVILEGES.childGoalsPage, animation: 'childGoalsPage' } },
  { path: 'child/:childId/goal/:id/evaluations', component: EvaluationComponent, title: titlePrefix + 'Evaluations', canActivate: [RoleGuard], data: { allowRoles: PRIVILEGES.goalEvaluationsPage, animation: 'goalEvaluationsPage' } },
  { path: 'goal/:id/evaluations', component: EvaluationComponent, title: titlePrefix + 'Evaluations', canActivate: [RoleGuard], data: { allowRoles: PRIVILEGES.goalEvaluationsPage, animation: 'goalEvaluationsPage' } },
  { path: 'child/:id/strengths', component: StrengthComponent, title: titlePrefix + 'Strengths', canActivate: [RoleGuard], data: { allowRoles: PRIVILEGES.childStrengthsPage, animation: 'childStrengthsPage' } },
  { path: 'child/:id', component: ViewChildComponent, title: titlePrefix + 'Child info', canActivate: [RoleGuard], data: { allowRoles: PRIVILEGES.viewChildPage, animation: 'viewChildPage' } },
  { path: 'special-activities', component: SpecialActivityComponent, title: titlePrefix + 'Special Activities', canActivate: [RoleGuard], data: { allowRoles: PRIVILEGES.specialActivitiesPage, animation: 'specialActivitiesPage' } },
  { path: 'settings', component: SettingsComponent, title: titlePrefix + 'Settings', data: { animation: 'settingsPage' } },
  { path: 'child/:id/report', component: ReportChildComponent, title: titlePrefix + 'Child Report', canActivate: [RoleGuard], data: { allowRoles: PRIVILEGES.childReportPage, animation: 'childReportPage' } },
  { path: 'about', component: AboutUsComponent, title: titlePrefix + 'About Us', data: { animation: 'AboutUsPage' } },
  { path: '**', component: Page404Component, title: 'Page Not Found', data: { animation: 'pageNotFoundPage' } },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    scrollPositionRestoration: 'enabled',
    anchorScrolling: 'enabled',
    onSameUrlNavigation: 'reload'
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }




