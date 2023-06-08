import { HttpClient } from '@angular/common/http';
import { Injectable, OnInit } from '@angular/core';
import { environment as env } from 'src/environments/environment';
import { UtilityService } from './utility.service';
import { BehaviorSubject, Observable, ReplaySubject, throwError } from 'rxjs';
import { IAccountEntity, IChangePassword, ICreateAccount, SucResEditDel, User } from '../../../../interfaces';
import { MatDialog } from '@angular/material/dialog';
import { PasswordDialogComponent } from '../components/dialogs/password-dialog/password-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class AccountService implements OnInit {
  public URL = env.API + 'account';
  public accounts = new ReplaySubject<IAccountEntity[]>();
  public isLoggerIn: boolean = false;

  constructor(private http: HttpClient, private ut: UtilityService, private dialog: MatDialog) {
    if (this.ut.userHasAny('Admin'))
      this.fetch();
  }

  ngOnInit(): void {
    this.isLoggerIn = false;
  }

  /**Note: fetch is called in add-edit-child
   * create api request to retrieve accounts information and broadcast it to `accounts` BehaviorSubject.
   * @returns `resolve` if request succeeded. Otherwise `reject`.
   */
  public fetch(manageLoading = false): Promise<void> {
    return new Promise(async (res, rej) => {
      manageLoading && this.ut.isLoading.next(true)
      this.http.get<IAccountEntity[]>(this.URL, { params: { 'FK': true } })
        .subscribe({
          next: (v) => {
            this.accounts.next(v);
            res();
          }, error: (e) => {
            this.ut.errorDefaultDialog(e, "Sorry, there was a problem fetching the accounts information. Please try again later or check your connection."); rej(e);
          },complete:()=>manageLoading && this.ut.isLoading.next(false),
        });
    })
  }

  /**
 * api request to post a account information. Then append the new account with previous `accounts` BehaviorSubject and emit the new accounts array.
 * @returns `resolve` if request succeeded. Otherwise `reject`.
 */
  post(account: ICreateAccount, manageLoading = false): Promise<IAccountEntity> {
    return new Promise(async (res, rej) => {
      if ((await this.sensitive().catch(() => false) !== true)) {
        this.ut.notify(null);
        return rej();
      }
      manageLoading && this.ut.isLoading.next(true);
      this.http.post<IAccountEntity>(this.URL, account)
        .subscribe({
          next: (v) => {
            this.fetch();
            res(v);
          },
          error: (e) => {
            this.ut.errorDefaultDialog(e, "Sorry, there was a problem registering the account. Please try again later or check your connection.");
            rej(e);
          },complete:()=>{manageLoading && this.ut.isLoading.next(false);}
        })
    });
  }

  changePassword(changePassword: IChangePassword, manageLoading = false): Promise<SucResEditDel> {
    return new Promise(async (res, rej) => {
      manageLoading && this.ut.isLoading.next(true);
      this.http.patch<SucResEditDel>(this.URL + '/' + this.ut.user.value?.accountId, changePassword)
        .subscribe({
          next: (v) => {
            this.fetch();
            res(v);
          },
          error: e => {
            this.ut.errorDefaultDialog(e, "Sorry, there was a problem changing your password. Please try again later or check your connection.");
            rej(e);
          },complete:()=>{manageLoading && this.ut.isLoading.next(false);}
        })
    })
  }

  /**Used only by Admin (can reset password without providing the old password) */
  put(id: number, account: Partial<IAccountEntity>, manageLoading = false): Promise<SucResEditDel> {
    return new Promise(async (res, rej) => {
      if ((await this.sensitive().catch(() => false) !== true)) {
        this.ut.notify(null);
        return rej();
      }
      manageLoading && this.ut.isLoading.next(true);
      this.http.put<SucResEditDel>(this.URL + '/' + id, account)
        .subscribe({
          next: (v) => {
            this.fetch();
            res(v);
          },
          error: e => {
            this.ut.errorDefaultDialog(e, "Sorry, there was a problem editing the account information. Please try again later or check your connection.");
            rej(e);
          },complete:()=>{manageLoading && this.ut.isLoading.next(false);}
        })
    })
  }

  delete(id: number, manageLoading = false) {
    return new Promise(async (res, rej) => {
      if ((await this.sensitive().catch(() => false) !== true)) {
        this.ut.notify(null);
        return rej();
      }
      manageLoading && this.ut.isLoading.next(true);
      this.http.delete<SucResEditDel>(this.URL + '/' + id)
        .subscribe({
          next: (v) => {
            this.fetch();
            res(v);
          },
          error: (e) => {
            this.ut.errorDefaultDialog(e, "Sorry, there was a problem deleting the account. Please try again later or check your connection."); rej(e);
          },complete:()=>{manageLoading && this.ut.isLoading.next(false);}
        })
    })
  }

  /**
   * this function should be called before any sensitive operation.
   * It will check `isLoggerIn`(is the user the same logged in user) boolean value:
   * - `false` it will show dialog for re-enter password of the account and validate it, then reset `isLoggerIn` to true and resolve.
   * - `true` will resolve with void.
   */
  private sensitive(): Promise<boolean> {
    return new Promise((res, rej) => {
      if (this.isLoggerIn === true)
        res(true);
      else this.dialog.open<PasswordDialogComponent, false, true | undefined>(PasswordDialogComponent, { data: false, direction: this.ut.getDirection() })
        .afterClosed().subscribe((v) => {
          if (v === true) {
            this.isLoggerIn = v;
            res(true);
          } else {
            rej(false);
          }
        });
    })
  }

  reenter(password: string): Observable<User> {
    let username = this.ut.user.value?.username;
    if (typeof username === 'string')
      return this.http.post<User>(env.AUTH + 'login', { username, password });
    return throwError(() => 'You must login!')
  }
}
