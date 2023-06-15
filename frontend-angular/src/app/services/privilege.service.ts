import { Injectable } from '@angular/core';
import { Role } from '../../../../interfaces';

@Injectable({
  providedIn: 'root'
})
export class PrivilegeService {

  public action = PRIVILEGE;

  constructor() {
  }
}
const A: Role[] = ['Admin'];
const AH: Role[] = ['Admin', 'HeadOfDepartment'];
const AHT: Role[] = ['Admin', 'HeadOfDepartment', 'Teacher'];
const AHTP: Role[] = ['Admin', 'HeadOfDepartment', 'Teacher', 'Parent'];
export const PRIVILEGE = {
  printTable: AH,
  reportChild: AH,
}