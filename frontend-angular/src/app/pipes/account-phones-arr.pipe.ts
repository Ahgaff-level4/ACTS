import { Pipe, PipeTransform } from '@angular/core';
import { IAccountEntity } from '../../../../interfaces';

@Pipe({
  name: 'accountPhonesArr'
})
export class AccountPhonesArrPipe implements PipeTransform {

  /**@returns array of phones phone0 is first index until phone9 is ninth index. */
  transform(account: IAccountEntity | undefined): string[] {
    if (!account)
      return [];
    const phones = [];
    for (let i = 0; i < 10; i++)
      phones.push(account['phone' + i]);
    return phones;
  }
}
