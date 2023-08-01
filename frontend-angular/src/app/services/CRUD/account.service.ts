import { HttpClient } from '@angular/common/http';
import { Injectable, OnInit } from '@angular/core';
import { environment as env } from 'src/environments/environment';
import { BehaviorSubject, Observable, map, tap, throwError } from 'rxjs';
import { IAccountEntity, IChangePassword, ICreateAccount, SucResEditDel, User } from '../../../../../interfaces';
import { PasswordDialogComponent } from '../../components/dialogs/password-dialog/password-dialog.component';
import { PrivilegeService } from '../privilege.service';
import { NotificationService } from '../notification.service';
import { PersonService } from './person.service';
import { DisplayService } from '../display.service';

@Injectable({
  providedIn: 'root'
})
export class AccountService implements OnInit {
  public URL = env.API + 'account';
  public accounts$ = new BehaviorSubject<IAccountEntity[] | undefined>(undefined);
  public isLoggerIn: boolean = false;

  constructor(private http: HttpClient, private display: DisplayService,
    private pr: PrivilegeService,
    private nt: NotificationService, private personService: PersonService) {
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
      manageLoading && this.display.isLoading.next(true)
      this.http.get<IAccountEntity[]>(this.URL, { params: { 'FK': true } })
        .subscribe({
          next: (v) => {
            this.accounts$.next(v);
            res();
          }, error: (e) => {
            manageLoading && this.display.isLoading.next(false);
            this.nt.errorDefaultDialog(e, "Sorry, there was a problem fetching the accounts information. Please try again later or check your connection."); rej(e);
          }, complete: () => manageLoading && this.display.isLoading.next(false),
        });
    })
  }

  public fetchOne(id: number, manageLoading = false): Observable<IAccountEntity> {
    manageLoading && this.display.isLoading.next(true);
    return this.http.get<IAccountEntity[]>(this.URL + '/' + id).pipe(
      tap(() => manageLoading && this.display.isLoading.next(false)),
      map(v => {
        if (v[0])
          return v[0];
        throw 'Not found';
      })
    )
  }

  /**
 * api request to post a account information. Then append the new account with previous `accounts` BehaviorSubject and emit the new accounts array.
 * @returns `resolve` if request succeeded. Otherwise `reject`.
 */
  post(account: ICreateAccount, manageLoading = false, isSensitive = true): Promise<IAccountEntity> {
    return new Promise(async (res, rej) => {
      if (isSensitive)
        if ((await this.sensitive().catch(() => false) !== true)) {
          return rej();
        }
      manageLoading && this.display.isLoading.next(true);
      this.http.post<IAccountEntity>(this.URL, account)
        .subscribe({
          next: (v) => {
            this.fetch();
            res(v);
          },
          error: (e) => {
            manageLoading && this.display.isLoading.next(false);
            this.nt.errorDefaultDialog(e, "Sorry, there was a problem registering the account. Please try again later or check your connection.");
            rej(e);
          }, complete: () => { manageLoading && this.display.isLoading.next(false); }
        })
    });
  }

  changePassword(changePassword: IChangePassword, manageLoading = false): Promise<SucResEditDel> {
    return new Promise(async (res, rej) => {
      manageLoading && this.display.isLoading.next(true);
      this.http.patch<SucResEditDel>(this.URL + '/' + this.pr.user.value?.accountId, changePassword)
        .subscribe({
          next: (v) => {
            this.fetch();
            res(v);
          },
          error: e => {
            manageLoading && this.display.isLoading.next(false);
            this.nt.errorDefaultDialog(e, "Sorry, there was a problem changing your password. Please try again later or check your connection.");
            rej(e);
          }, complete: () => { manageLoading && this.display.isLoading.next(false); }
        })
    })
  }

  /**Used only by Admin (can reset password without providing the old password) */
  put(id: number, account: Partial<IAccountEntity>, manageLoading = false): Promise<SucResEditDel> {
    return new Promise(async (res, rej) => {
      if ((await this.sensitive().catch(() => false) !== true)) {
        return rej();
      }
      manageLoading && this.display.isLoading.next(true);
      this.http.put<SucResEditDel>(this.URL + '/' + id, account)
        .subscribe({
          next: (v) => {
            this.fetch();
            res(v);
          },
          error: e => {
            manageLoading && this.display.isLoading.next(false);
            this.nt.errorDefaultDialog(e, "Sorry, there was a problem editing the account information. Please try again later or check your connection.");
            rej(e);
          }, complete: () => { manageLoading && this.display.isLoading.next(false); }
        })
    })
  }

  delete(account: IAccountEntity, manageLoading = false): Promise<SucResEditDel> {
    return new Promise(async (res, rej) => {
      if ((await this.sensitive().catch(() => false) !== true)) {
        return rej();
      }
      try {
        const success = await Promise.all([
          new Promise(async (res, rej) => {
            manageLoading && this.display.isLoading.next(true);
            this.http.delete<SucResEditDel>(this.URL + '/' + account.id)
              .subscribe({
                next: (v) => {
                  this.fetch();
                  res(v);
                },
                error: (e) => {
                  manageLoading && this.display.isLoading.next(false);
                  this.nt.errorDefaultDialog(e, "Sorry, there was a problem deleting the account. Please try again later or check your connection."); rej(e);
                }, complete: () => { manageLoading && this.display.isLoading.next(false); }
              })
          }),
          this.personService.deletePerson(account.personId, false)
        ]);
        return res(success[1]);
      } catch (e) {
        return rej(e);
      }
    });
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
        return res(true);
      else this.nt.openDialog<PasswordDialogComponent, false, true | undefined>(PasswordDialogComponent, false)
        .afterClosed().subscribe((v) => {
          if (v === true) {
            this.isLoggerIn = v;
            return res(true);
          } else {
            return rej(false);
          }
        });
    })
  }

  /**person add/edit/delete is not sensitive. But when the person is bind to account person! We need to call the person's functions such as add/edit... in a sensitive way that what the wrapper will do
   * @param fun is the function to be wrapped.
   * @param param is any param that should be provided to the wrapped function.
   * @return the function returns value
   */
  public sensitiveWrapper<T>(fun: (v?: any) => T, param?: any): Promise<T> {
    return new Promise(async (res, rej) => {
      if ((await this.sensitive().catch(() => false) !== true)) {
        return rej();
      }
      try {
        return res(fun(param));
      } catch (e) {
        return rej(e);
      }
    })

  }

  reenter(password: string): Observable<User> {
    let username = this.pr.user.value?.username;
    if (typeof username === 'string')
      return this.http.post<User>(env.AUTH + 'login', { username, password });
    return throwError(() => 'You must login!')
  }

  /**pop-up a delete confirmation dialog, then if user approve: delete and resolve with 'deleted' */
  deleteAccount(account: IAccountEntity): Promise<'deleted'> {
    return new Promise((res, rej) => {
      this.nt.showMsgDialog({
        content: this.display.translate('You are about to delete the account: ') + account.username + this.display.translate(" permanently. If account has or had role Parent: any child has this account as parent will no longer has it. If account has or had role Teacher: any child has this account as teacher will no longer has it. You won't be able to delete the account if there is at least one goal or evaluation still exist and have been created by this account."),
        type: 'confirm',
        buttons: [{ color: 'primary', type: 'Cancel' }, { color: 'warn', type: 'Delete' }]
      }).afterClosed().subscribe(async (v) => {
        if (v === 'Delete') {
          try {
            await this.delete(account, true);
            this.nt.notify("Deleted successfully", 'The account has been deleted successfully', 'success');
            return res('deleted');
          } catch (e) { }
        }
      })

    })
  }
}
