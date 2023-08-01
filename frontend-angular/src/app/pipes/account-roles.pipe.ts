import { Pipe, PipeTransform } from '@angular/core';
import { Role } from '../../../../interfaces'
import { TranslatePipe } from '@ngx-translate/core';
@Pipe({
  name: 'accountRoles',
})
export class AccountRolesPipe implements PipeTransform {

  constructor(private translatePipe: TranslatePipe) { }

  transform(roles: Role[]): unknown {
    return roles.map(v => this.translate(v === 'HeadOfDepartment' ? 'Head of Department' : v)).join(this.translate(', '));
  }

  private translate(key: string | null | undefined, ...args: any[]): string {
    if (key === null || key === undefined)
      return '';
    return this.translatePipe.transform(key, args);
  }
}
