import { Injectable } from '@angular/core';
import { Role } from '../../../../interfaces';
import { UtilityService } from './utility.service';

@Injectable({
  providedIn: 'root'
})
export class PrivilegeService {

  constructor(private ut: UtilityService) {
  }

  public canUser(actions: Action[]): boolean;
  public canUser(...actions: Action[]): boolean;
  public canUser(action: Action): boolean;
  public canUser(action: Action | Action[]): boolean {
    if (Array.isArray(action))
      return action.every(v => this.userHasAny(PRIVILEGE[v]));
    else
      return this.userHasAny(PRIVILEGE[action])
  }

  /**
 * @return `true` if user's roles has any one role of the param `roles`. If user has no role overlap with param `roles` then return `false`
 */
  private userHasAny(...roles: Role[] | Role[][]): boolean {
    const allowedRoles: Role[] = Array.isArray(roles[0]) ? roles[0] as Role[] : roles as Role[];
    if (this.ut.user.value)
      for (let r of this.ut.user.value.roles)
        if (allowedRoles.includes(r))
          return true;

    return false;
  }


  /**@returns translated array of can and cannot privileges (e.g.'Can access accounts page') */
  rolePrivileges(role: Role): string[] {
    const privileges = [];

    if (PRIVILEGE.accountsPage.concat(PRIVILEGE.viewAccountPage).includes(role))
      privileges.push('Can access accounts page.');
    if (PRIVILEGE.editAccountPage.concat(PRIVILEGE.addAccountPage).includes(role))
      privileges.push('Can add/edit/delete an account.');
    if (PRIVILEGE.accountAddressPhone.includes(role))
      privileges.push('Has address phones information.');
    if (PRIVILEGE.fieldsPage.includes(role))
      privileges.push('Can access fields page.');
    if (PRIVILEGE.addField.concat(PRIVILEGE.editField).concat(PRIVILEGE.deleteField).includes(role))
      privileges.push('Can add/edit/delete a field.');
    if (PRIVILEGE.programsPage.includes(role))
      privileges.push('Can access programs page.');
    if (PRIVILEGE.addProgram.concat(PRIVILEGE.editProgram).concat(PRIVILEGE.deleteProgram).includes(role))
      privileges.push('Can add/edit/delete a program.');
    if (role == 'Parent')
      privileges.push('Can access his children only.')
    if (PRIVILEGE.childrenPage.concat(PRIVILEGE.viewChildPage).includes(role))
      privileges.push('Can access children page.');
    if (PRIVILEGE.addChildPage.includes(role))
      privileges.push('Can access add child page.');
    if (PRIVILEGE.editChildPage.includes(role))
      privileges.push('Can access edit child page.');
    if (PRIVILEGE.childReportPage.includes(role))
      privileges.push('Can access report child page.');
    if (PRIVILEGE.archiveChild.includes(role))
      privileges.push('Can archive a child information.')
    if (PRIVILEGE.childGoalsPage.includes(role))
      privileges.push("Can access child's goals page.");
    if (PRIVILEGE.addGoal.includes(role))
      privileges.push("Can add a goal.")
    if (PRIVILEGE.editGoal.concat(PRIVILEGE.deleteGoal).includes(role))
      privileges.push("Can edit/delete a goal.")
    if (PRIVILEGE.childStrengthsPage.includes(role))
      privileges.push("Can access child's strengths page.");
    if (PRIVILEGE.addStrength.includes(role))
      privileges.push("Can add a strength.")
    if (PRIVILEGE.editStrength.concat(PRIVILEGE.deleteStrength).includes(role))
      privileges.push("Can edit/delete a strength.")
    if (PRIVILEGE.goalEvaluationsPage.includes(role))
      privileges.push("Can access goal's evaluations page.");
    if (PRIVILEGE.addEvaluation.includes(role))
      privileges.push("Can add an evaluation.")
    if (PRIVILEGE.editEvaluation.concat(PRIVILEGE.deleteEvaluation).includes(role))
      privileges.push("Can edit/delete an evaluation.")
    if (PRIVILEGE.programActivitiesPage.includes(role))
      privileges.push("Can access program's activities page.")
    if (PRIVILEGE.specialActivitiesPage.includes(role))
      privileges.push("Can access special activities page.")
    if (PRIVILEGE.addActivity.concat(PRIVILEGE.editActivity).concat(PRIVILEGE.deleteActivity).includes(role))
      privileges.push("Can add/edit/delete an activity.")
    if (PRIVILEGE.notificationDrawer.includes(role))
      privileges.push("Can view notifications drawer.")
    if (PRIVILEGE.broadcastMessage.includes(role))
      privileges.push('Can access online accounts and send/broadcast notification message.')
    if (PRIVILEGE.dashboard.includes(role))
      privileges.push('Can access dashboard.')
    if (PRIVILEGE.backupRestore.includes(role))
      privileges.push('Can create a backup and restore database.')
    if (PRIVILEGE.printTable.includes(role))
      privileges.push("Can print/export any table that can access.")

    return privileges.map(v => this.ut.translate(v));
  }

}
const A: Role[] = ['Admin'];
const AH: Role[] = ['Admin', 'HeadOfDepartment'];
const AHT: Role[] = ['Admin', 'HeadOfDepartment', 'Teacher'];
const AHTP: Role[] = ['Admin', 'HeadOfDepartment', 'Teacher', 'Parent'];
const P: Role[] = ['Parent'];
const AT: Role[] = ['Admin', 'Teacher']
export type Action = keyof typeof PRIVILEGE;
export const PRIVILEGE = {
  //ACCOUNT
  accountsPage: A,
  viewAccountPage: A,
  addAccountPage: A,
  editAccountPage: A,
  accountAddressPhone: P,
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
  programActivitiesPage: AHT,
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