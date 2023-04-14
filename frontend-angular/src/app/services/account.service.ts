import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment as env } from 'src/environment';
import { UtilityService } from './utility.service';
import { BehaviorSubject } from 'rxjs';
import { IAccountEntity, ICreateAccount, SucResEditDel } from '../../../../interfaces';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  public URL = env.API + 'account';
  public accounts = new BehaviorSubject<IAccountEntity[]>([]);

  constructor(private http: HttpClient, private ut: UtilityService) {
  }

  /**
   * create api request to retrieve accounts information and broadcast it to `accounts` BehaviorSubject.
   * @returns `resolve` if request succeeded. Otherwise `reject`.
   */
  fetch(manageLoading = false): Promise<void> {
    return new Promise((res, rej) => {
      manageLoading && this.ut.isLoading.next(true)
      this.http.get<IAccountEntity[]>(this.URL, { params: { 'FK': true } })
        .subscribe({
          next: (v) => {
            manageLoading && this.ut.isLoading.next(false);
            this.accounts.next(v);
            res();
          }, error: (e) => {
            manageLoading && this.ut.isLoading.next(false);
            this.ut.errorDefaultDialog(e, "Sorry, there was a problem fetching the accounts information. Please try again later or check your connection."); rej(e);
          }
        });
    })
  }

  /**
 * api request to post a account information. Then append the new account with previous `accounts` BehaviorSubject and emit the new accounts array.
 * @returns `resolve` if request succeeded. Otherwise `reject`.
 */
  post(account: ICreateAccount, manageLoading = false): Promise<IAccountEntity> {
    return new Promise((res, rej) => {
      manageLoading && this.ut.isLoading.next(true);
      this.http.post<IAccountEntity>(this.URL, account)
        .subscribe({
          next: (v) => {
            manageLoading && this.ut.isLoading.next(false);
            this.fetch(manageLoading);
            res(v);
          },
          error: (e) => {
            manageLoading && this.ut.isLoading.next(false);
            this.ut.errorDefaultDialog(e, "Sorry, there was a problem registering the account. Please try again later or check your connection.");
            rej(e);
          }
        })
    });
  }

  patch(id: number, account: Partial<IAccountEntity>, manageLoading = false): Promise<SucResEditDel> {
    return new Promise((res, rej) => {
      manageLoading && this.ut.isLoading.next(true);
      this.http.patch<SucResEditDel>(this.URL + '/' + id, account)
        .subscribe({
          next: (v) => {
            manageLoading && this.ut.isLoading.next(false);
            this.fetch(manageLoading);
            res(v);
          },
          error: e => {
            manageLoading && this.ut.isLoading.next(false);
            this.ut.errorDefaultDialog(e, "Sorry, there was a problem editing the account information. Please try again later or check your connection.");
            rej(e);
          }
        })
    })
  }
}
