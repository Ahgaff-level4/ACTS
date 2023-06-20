import { Injectable } from '@angular/core';
import { Role } from '../../../../interfaces';
import { UtilityService } from './utility.service';

@Injectable({
  providedIn: 'root'
})
export class PrivilegeService {

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

  constructor(private ut: UtilityService) {

  }
}
const A: Role[] = ['Admin'];
const AH: Role[] = ['Admin', 'HeadOfDepartment'];
const AHT: Role[] = ['Admin', 'HeadOfDepartment', 'Teacher'];
const AHTP: Role[] = ['Admin', 'HeadOfDepartment', 'Teacher', 'Parent'];
const P: Role[] = ['Parent'];
const AT:Role[] = ['Admin','Teacher']
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
  addField:AH,
  editField:AH,
  deleteField:AH,
  //PROGRAM
  programsPage: AHT,
  addProgram:AH,
  editProgram:AH,
  deleteProgram:AH,
  //CHILD
  childrenPage: AHTP,
  addChildPage: AH,
  editChildPage: AH,
  childReportPage: AH,
  viewChildPage: AHTP,
  archiveChild: A,
  //GOAL
  childGoalsPage: AHTP,
  addGoal:AT,
  editGoal:AHT,
  deleteGoal:AHT,
  //STRENGTH
  childStrengthsPage: AHTP,
  addStrength:AT,
  editStrength:AHT,
  deleteStrength:AHT,
  //EVALUATION
  goalEvaluationsPage: AHTP,
  addEvaluation:AT,
  editEvaluation:AHT,
  deleteEvaluation:AHT,
  //ACTIVITY
  programActivitiesPage: AHT,
  specialActivitiesPage: AH,
  addActivity: AH,
  editActivity: AH,
  deleteActivity:AH,
  //NOTIFICATION
  broadcastMessage:A,
  notificationDrawer:AHTP,
  //OTHER
  dashboard: A,
  backupRestore:A,
  /**print/export/copy table */
  printTable: AH,

}