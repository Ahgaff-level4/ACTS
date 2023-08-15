import { Pipe, PipeTransform } from '@angular/core';
import { IAccountEntity, User } from '../../../../interfaces';
import { TranslatePipe } from '@ngx-translate/core';

@Pipe({
  name: 'accountPhones'
})
export class AccountPhonesPipe implements PipeTransform {

  constructor(private translatePipe: TranslatePipe) { }

  /**Display an account phones joined by a comma. Empty string if none */
  transform(account: IAccountEntity | User): string {
    let phones: string[];
    if (account.accountId)
      phones = account.phones;
    else
      phones = this.accountPhonesArr(account as IAccountEntity);
    if (phones.length == 0)
      return '';
    return phones.filter(v => !!v).join(this.translate(', '));
  }

  private accountPhonesArr(account: IAccountEntity | undefined): string[] {
    if (!account)
      return [];
    const phones = [];
    for (let i = 0; i < 10; i++)
      phones.push(account['phone' + i]);
    return phones;
  }

  private translate(key: string | null | undefined, ...args: any[]): string {
    if (key === null || key === undefined)
      return '';
    return this.translatePipe.transform(key, args);
  }
}
