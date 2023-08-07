import { Component, EventEmitter } from '@angular/core';
import { IAccountEntity, IChildEntity, Role } from '../../../../../../../interfaces';
import { EMPTY, Observable, catchError, tap } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountService } from 'src/app/services/CRUD/account.service';
import { DisplayService } from 'src/app/services/display.service';
import { UnsubOnDestroy } from 'src/app/unsub-on-destroy';
import { PrivilegeService } from 'src/app/services/privilege.service';
import { NotificationService } from 'src/app/services/notification.service';
import { SelectChildComponent } from 'src/app/components/dialogs/select-child/select-child.component';

@Component({
  selector: 'app-view-account',
  templateUrl: './view-account.component.html',
  styleUrls: ['./view-account.component.scss']
})
export class ViewAccountComponent extends UnsubOnDestroy {
  public account$!: Observable<IAccountEntity>;

  constructor(public route: ActivatedRoute, public service: AccountService, private nt: NotificationService,
    private display: DisplayService, public pr: PrivilegeService, public router: Router,) { super(); }

  ngOnInit(): void {
    let accountId = +(this.route.snapshot.paramMap.get('id') ?? 'null');
    if (Number.isInteger(accountId))
      this.sub.add(this.service.accounts$.subscribe(() => {//to refresh the account data when accounts changed
        this.account$ = this.service.fetchOne(accountId, true).pipe(tap(() => {
          setTimeout(() => {//hash won't works if account is loading...
            const hash = location.hash;
            location.hash = '#';
            location.hash = hash;
          });
        }),
          catchError(() => {
            this.display.isLoading.next(false);
            this.nt.errorDefaultDialog("Sorry, there was a problem fetching the account information. Please try again later or check your connection.");
            this.router.navigateByUrl('404');
            return EMPTY;
          }));
      }));
    else {
      this.display.isLoading.next(false);
      this.nt.errorDefaultDialog("Sorry, there was a problem fetching the account information. Please try again later or check your connection.");
      this.router.navigateByUrl('404');
    }

  }

  public back = new EventEmitter<void>();
  deleteTheAccount(account: IAccountEntity) {//navigate back on delete
    this.service.deleteAccount(account).then(v => {
      if (v == 'deleted')
        this.back.emit();
    });
  }

  accountHasAny(account: IAccountEntity, ...roles: Role[]): boolean {
    for (let r of account.roles)
      if (roles.includes(r))
        return true;
    return false;
  }

  editKids(data: { state: 'parent' | 'teacher', accountId: number }) {
    this.nt.openDialog<SelectChildComponent,
      { state: 'teacher' | 'parent', accountId: number },
      undefined | IChildEntity[]>
      (SelectChildComponent, data, '700px');
  }

  editTeaches(data: { state: 'parent' | 'teacher', accountId: number }) {
    this.nt.openDialog<SelectChildComponent,
      { state: 'teacher' | 'parent', accountId: number },
      undefined | IChildEntity[]>
      (SelectChildComponent, data, '700px');
  }
}
