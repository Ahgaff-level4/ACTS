import { Injectable } from '@angular/core';
import { Role } from '../../../../interfaces';

@Injectable({
  providedIn: 'root'
})
export class PrivilegeService {
  public printTable: Role[] = ['Admin','HeadOfDepartment']


  constructor() { }
}
