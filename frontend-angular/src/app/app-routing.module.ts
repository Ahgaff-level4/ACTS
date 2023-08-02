import { NgModule, inject } from '@angular/core';
import { ActivatedRouteSnapshot, Route, Router, RouterModule, RouterStateSnapshot, Routes, UrlMatchResult, UrlSegment, UrlSegmentGroup } from '@angular/router';
import { HomeComponent } from './components/pages/home/home.component';
import { FieldComponent } from './components/pages/field/field.component';
import { LoginComponent } from './components/pages/login/login.component';
import { ProgramComponent } from './components/pages/program/program.component';
import { ChildrenComponent } from './components/pages/children/children/children.component';
import { AddEditChildComponent } from './components/pages/children/add-edit-child/add-edit-child.component';
import { Role, User } from '../../../interfaces';
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
import { DisplayService } from './services/display.service';

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
      const display = inject(DisplayService);
      return confirm(display.translate('Changes you made may not be saved.'));
    }
  }
  return true;
}


export async function RoleGuard(route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot) {
  const router = inject(Router);
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
        showUnauthorizeDialog(false);
        return false;
      } else user = isLogin;
    } else {//show error dialog if user set `isRememberMe` to false
      showUnauthorizeDialog(false);
      return false;
    }
  } else user = loginService.pr.user.value;

  for (let r of allowRoles)
    if (hasRole(user, r))
      return true;

  showUnauthorizeDialog(true);
  return false;
  //----------------------------------------

  function showUnauthorizeDialog(isLoggedIn: boolean) {
    nt.showMsgDialog({
      type: 'error',
      title: { text: 'Insufficient privilege!' },
      content: `You don't have sufficient privilege to do this action!`,
      buttons: [{ color: 'primary', type: isLoggedIn ? 'Login by another account' : 'Login' }, { color: 'accent', type: 'Ok' },]
    }).afterClosed().subscribe(v => {
      if (v === 'Login' || v == 'Login by another account')
        router.navigateByUrl('login');
    });
  }

  function hasRole(user: User, role: Role) {
    return !!user
      && Array.isArray(user.roles)
      && user.roles.includes(role);
  }
}

/**Matches any url that ends with 'str/:id' where id is number such as 'blah/blah/str/3'
 * @param thenSegment same behavior but concatenated with `thenSegment` value. (i.e.'str/:id/thenSegment') such as 'blah/str/3/thenSegment'
 */
function endsWithStrThenId(str: string) {
  return (url: UrlSegment[], group: UrlSegmentGroup, route: Route): UrlMatchResult | null => {
    if (url.join('/').match(new RegExp(`([\\s\\S]*${str}\\/\\d+(\\b|\\W|[#\\?]([\\s\\S]*)))$`, 'g'))) {
      //last segment is id
      const posParams: { [name: string]: UrlSegment } = { id: url[url.length - (Number.isInteger(+url[url.length - 1].path) ? 1 : 2)] };
      for (let i = 0; i < url.length; i++)
        if (url[i].path == 'child' || url[i].path == 'account')
          posParams[url[i].path + 'Id'] = url[i + 1];
      return {
        consumed: url,
        posParams
      };
    }
    return null;
  }
}
function endsWithStr(str: string) {
  return (url: UrlSegment[], group: UrlSegmentGroup, route: Route): UrlMatchResult | null => {
    if (url.join('/').match(new RegExp(`([\\s\\S]*\\/${str}(\\b|\\W|[#\\?]([\\s\\S]*)))$`, 'g'))) {
      return { consumed: url };
    }
    return null;
  }
}
export type ACTS_Segment = '' | 'login' | 'fields' | 'field' | 'programs'
  | 'program' | 'accounts' | 'account' | 'child' | 'teachers' | 'teaches'
  | 'teacher' | 'add-account' | 'edit-account' | 'activities' | 'kids' | 'parent'
  | 'add-child' | 'edit-child' | 'children' | 'goals' | 'evaluations' | 'goal'
  | 'strengths' | 'special-activities' | 'settings' | 'report' | 'about';

const titlePrefix = 'ACTS - ';
export const routes: Routes = [
  { path: '', component: HomeComponent, title: titlePrefix + 'Home', pathMatch: 'full', data: { animation: 'homePage' } },
  { path: 'main', redirectTo: '/' },
  { path: 'home', redirectTo: '/' },
  { path: 'index', redirectTo: '/' },
  { path: 'login', component: LoginComponent, title: titlePrefix + 'Login', data: { animation: 'loginPage' } },
  { path: 'fields', component: FieldComponent, title: titlePrefix + 'Fields', canActivate: [RoleGuard], data: { allowRoles: PRIVILEGES['fieldsPage'], animation: 'fieldPage' } },
  { path: 'programs', component: ProgramComponent, title: titlePrefix + 'Programs', canActivate: [RoleGuard], data: { allowRoles: PRIVILEGES['programsPage'], animation: 'programPage' } },
  { path: 'accounts', component: AccountComponent, title: titlePrefix + 'Accounts', canActivate: [RoleGuard], data: { allowRoles: PRIVILEGES['accountsPage'], animation: 'accountPage' } },
  { matcher: endsWithStrThenId('account'), component: ViewAccountComponent, title: titlePrefix + 'Account', canActivate: [RoleGuard], data: { allowRoles: PRIVILEGES['viewAccountPage'], animation: 'viewAccountPage' } },
  { path: 'accounts/add-account', component: AddEditAccountComponent, title: titlePrefix + 'Add Account', canDeactivate: [PendingChangesGuard], canActivate: [RoleGuard], data: { allowRoles: PRIVILEGES['addAccountPage'], animation: 'addAccountPage' } },
  { matcher: endsWithStr('edit-account'), component: AddEditAccountComponent, title: titlePrefix + 'Edit Account', canDeactivate: [PendingChangesGuard], canActivate: [RoleGuard], data: { allowRoles: PRIVILEGES['editAccountPage'], animation: 'editAccountPage' } },
  { path: 'programs/:programOrField/:id/activities', component: ActivityComponent, title: titlePrefix + 'Activities', canActivate: [RoleGuard], data: { allowRoles: PRIVILEGES['activitiesPage'], animation: 'activitiesPage' } },
  { path: 'fields/:programOrField/:id/activities', component: ActivityComponent, title: titlePrefix + 'Activities', canActivate: [RoleGuard], data: { allowRoles: PRIVILEGES['activitiesPage'], animation: 'activitiesPage' } },
  { path: 'children', component: ChildrenComponent, title: titlePrefix + 'Children', canActivate: [RoleGuard], data: { allowRoles: PRIVILEGES['childrenPage'], animation: 'childrenPage' } },
  { path: 'children/add-child', component: AddEditChildComponent, title: titlePrefix + 'Add Child', canDeactivate: [PendingChangesGuard], canActivate: [RoleGuard], data: { allowRoles: PRIVILEGES['addChildPage'], animation: 'addChildPage' } },
  { matcher: endsWithStr('edit-child'), component: AddEditChildComponent, title: titlePrefix + 'Edit Child', canDeactivate: [PendingChangesGuard], canActivate: [RoleGuard], data: { allowRoles: PRIVILEGES['editChildPage'], animation: 'editChildPage' } },
  { path: 'children/child/:id/goals', component: GoalComponent, title: titlePrefix + 'Goals', canActivate: [RoleGuard], data: { allowRoles: PRIVILEGES['childGoalsPage'], animation: 'childGoalsPage' } },
  { path: 'children/child/:childId/goals/goal/:id/evaluations', component: EvaluationComponent, title: titlePrefix + 'Evaluations', canActivate: [RoleGuard], data: { allowRoles: PRIVILEGES['goalEvaluationsPage'], animation: 'goalEvaluationsPage' } },
  { path: 'children/child/:id/strengths', component: StrengthComponent, title: titlePrefix + 'Strengths', canActivate: [RoleGuard], data: { allowRoles: PRIVILEGES['childStrengthsPage'], animation: 'childStrengthsPage' } },
  { matcher: endsWithStrThenId('child'), component: ViewChildComponent, title: titlePrefix + 'Child info', canActivate: [RoleGuard], data: { allowRoles: PRIVILEGES['viewChildPage'], animation: 'viewChildPage' } },
  { path: 'special-activities', component: SpecialActivityComponent, title: titlePrefix + 'Special Activities', canActivate: [RoleGuard], data: { allowRoles: PRIVILEGES['specialActivitiesPage'], animation: 'specialActivitiesPage' } },
  { path: 'settings', component: SettingsComponent, title: titlePrefix + 'Settings', data: { animation: 'settingsPage' } },
  { path: 'children/child/:id/report', component: ReportChildComponent, title: titlePrefix + 'Child Report', canActivate: [RoleGuard], data: { allowRoles: PRIVILEGES['childReportPage'], animation: 'childReportPage' } },
  { path: 'about', component: AboutUsComponent, title: titlePrefix + 'About Us', data: { animation: 'AboutUsPage' } },
  { path: '**', component: Page404Component, title: 'Page Not Found', data: { animation: 'pageNotFoundPage' } },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    scrollPositionRestoration: 'enabled',
    anchorScrolling: 'enabled',
    onSameUrlNavigation: 'reload',
    scrollOffset: [0, 80]
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }




