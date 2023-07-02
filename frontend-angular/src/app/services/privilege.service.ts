import { Injectable } from '@angular/core';
import { Role, User } from '../../../../interfaces';
import { IPage, PAGES, UtilityService } from './utility.service';
import { BehaviorSubject, Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PrivilegeService {
  /**null means not loggedIn */
  public user: BehaviorSubject<User | null> = new BehaviorSubject<User | null>(null);

  constructor(private ut: UtilityService) {
  }

  public canUser(actions: Privilege[]): boolean;
  public canUser(...actions: Privilege[]): boolean;
  public canUser(action: Privilege): boolean;
  public canUser(action: Privilege | Privilege[]): boolean {
    if (Array.isArray(action))
      return action.every(v => this.userHasAny(PRIVILEGES[v]));
    else
      return this.userHasAny(PRIVILEGES[action])
  }

  /**
 * @return `true` if user's roles has any one role of the param `roles`. If user has no role overlap with param `roles` then return `false`
 */
  private userHasAny(...roles: Role[] | Role[][]): boolean {
    const allowedRoles: Role[] = Array.isArray(roles[0]) ? roles[0] as Role[] : roles as Role[];
    if (this.user.value)
      for (let r of this.user.value.roles)
        if (allowedRoles.includes(r))
          return true;

    return false;
  }

  /**Returns the pages that user has privilege to access */
  public getUserPages(): Observable<IPage[]>
  public getUserPages(without: 'Home'): Observable<IPage[]>
  public getUserPages(without: 'Settings'): Observable<IPage[]>
  public getUserPages(without?: 'Home' | 'Settings') {
    return this.user.pipe(map(v=>{
      const pages = PAGES.filter(v => v.privilege ? this.canUser(v.privilege) : true);
      if (without == 'Home') {
        const [home, ...noHome] = pages;
        return noHome;
      } else if (without == 'Settings') {
        pages.pop();
        return pages;
      }
      return pages;
    }))
  }

  /**@returns translated array of can and cannot privileges (e.g.'Can access accounts page') */
  rolePrivileges(role: Role): string[] {
    const privileges = [];

    if (PRIVILEGES.accountsPage.concat(PRIVILEGES.viewAccountPage).includes(role))
      privileges.push('Can access accounts page.');
    if (PRIVILEGES.editAccountPage.concat(PRIVILEGES.addAccountPage).includes(role))
      privileges.push('Can add/edit/delete an account.');
    if (PRIVILEGES.fieldsPage.includes(role))
      privileges.push('Can access fields page.');
    if (PRIVILEGES.addField.concat(PRIVILEGES.editField).concat(PRIVILEGES.deleteField).includes(role))
      privileges.push('Can add/edit/delete a field.');
    if (PRIVILEGES.programsPage.includes(role))
      privileges.push('Can access programs page.');
    if (PRIVILEGES.addProgram.concat(PRIVILEGES.editProgram).concat(PRIVILEGES.deleteProgram).includes(role))
      privileges.push('Can add/edit/delete a program.');
    if (role == 'Parent')
      privileges.push('Can access his children only.')
    if (PRIVILEGES.childrenPage.concat(PRIVILEGES.viewChildPage).includes(role))
      privileges.push('Can access children page.');
    if (PRIVILEGES.addChildPage.includes(role))
      privileges.push('Can access add child page.');
    if (PRIVILEGES.editChildPage.includes(role))
      privileges.push('Can access edit child page.');
    if (PRIVILEGES.childReportPage.includes(role))
      privileges.push('Can access report child page.');
    if (PRIVILEGES.archiveChild.includes(role))
      privileges.push('Can archive a child information.')
    if (PRIVILEGES.childGoalsPage.includes(role))
      privileges.push("Can access child's goals page.");
    if (PRIVILEGES.addGoal.includes(role))
      privileges.push("Can add a goal.")
    if (PRIVILEGES.editGoal.concat(PRIVILEGES.deleteGoal).includes(role))
      privileges.push("Can edit/delete a goal.")
    if (PRIVILEGES.childStrengthsPage.includes(role))
      privileges.push("Can access child's strengths page.");
    if (PRIVILEGES.addStrength.includes(role))
      privileges.push("Can add a strength.")
    if (PRIVILEGES.editStrength.concat(PRIVILEGES.deleteStrength).includes(role))
      privileges.push("Can edit/delete a strength.")
    if (PRIVILEGES.goalEvaluationsPage.includes(role))
      privileges.push("Can access goal's evaluations page.");
    if (PRIVILEGES.addEvaluation.includes(role))
      privileges.push("Can add an evaluation.")
    if (PRIVILEGES.editEvaluation.concat(PRIVILEGES.deleteEvaluation).includes(role))
      privileges.push("Can edit/delete an evaluation.")
    if (PRIVILEGES.activitiesPage.includes(role))
      privileges.push("Can access program's activities page.")
    if (PRIVILEGES.specialActivitiesPage.includes(role))
      privileges.push("Can access special activities page.")
    if (PRIVILEGES.addActivity.concat(PRIVILEGES.editActivity).concat(PRIVILEGES.deleteActivity).includes(role))
      privileges.push("Can add/edit/delete an activity.")
    if (PRIVILEGES.notificationDrawer.includes(role))
      privileges.push("Can view notifications drawer.")
    if (PRIVILEGES.broadcastMessage.includes(role))
      privileges.push('Can access online accounts and send/broadcast notification message.')
    if (PRIVILEGES.dashboard.includes(role))
      privileges.push('Can access dashboard.')
    if (PRIVILEGES.backupRestore.includes(role))
      privileges.push('Can create a backup and restore database.')
    if (PRIVILEGES.printTable.includes(role))
      privileges.push("Can print/export any table that can access.")

    return privileges.map(v => this.ut.translate(v));
  }

}
const A: Role[] = ['Admin'];
const AH: Role[] = ['Admin', 'HeadOfDepartment'];
const AHT: Role[] = ['Admin', 'HeadOfDepartment', 'Teacher'];
const AHTP: Role[] = ['Admin', 'HeadOfDepartment', 'Teacher', 'Parent'];
const P: Role[] = ['Parent'];
const T: Role[] = ['Teacher'];
const AT: Role[] = ['Admin', 'Teacher']
export type Privilege = keyof typeof PRIVILEGES;
export const PRIVILEGES = {
  //ACCOUNT
  accountsPage: A,
  viewAccountPage: A,
  addAccountPage: A,
  editAccountPage: A,
  //FIELD
  fieldsPage: AHT,
  addField: AH,
  editField: AH,
  deleteField: AH,
  //PROGRAM
  programsPage: AHT,
  addProgram: AH,
  editProgram: AH,
  deleteProgram: AH,
  //CHILD
  childrenPage: AHTP,
  addChildPage: AH,
  editChildPage: AH,
  childReportPage: AH,
  viewChildPage: AHTP,
  archiveChild: A,
  //GOAL
  childGoalsPage: AHTP,
  addGoal: AT,
  editGoal: AHT,
  deleteGoal: AHT,
  //STRENGTH
  childStrengthsPage: AHTP,
  addStrength: AT,
  editStrength: AHT,
  deleteStrength: AHT,
  //EVALUATION
  goalEvaluationsPage: AHTP,
  addEvaluation: AT,
  editEvaluation: AHT,
  deleteEvaluation: AHT,
  //ACTIVITY
  activitiesPage: AHT,
  specialActivitiesPage: AH,
  addActivity: AH,
  editActivity: AH,
  deleteActivity: AH,
  //NOTIFICATION
  notificationDrawer: AHTP,
  broadcastMessage: A,
  //OTHER
  dashboard: A,
  backupRestore: A,
  /**print/export/copy table */
  printTable: AH,
}