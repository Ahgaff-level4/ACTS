import { Component, EventEmitter } from '@angular/core';
import { IAccountEntity, IChildEntity, Role } from '../../../../../../../interfaces';
import { EMPTY, Observable, catchError, combineLatest, concatAll, map, tap } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { AccountService } from 'src/app/services/CRUD/account.service';
import { UtilityService } from 'src/app/services/utility.service';
import { UnsubOnDestroy } from 'src/app/unsub-on-destroy';
import { PrivilegeService } from 'src/app/services/privilege.service';
import { DisplayService } from 'src/app/services/display.service';
import { NotificationService } from 'src/app/services/notification.service';
import { TitleLink } from 'src/app/components/static/title/title.component';
import { ChildService } from 'src/app/services/CRUD/child.service';

@Component({
  selector: 'app-view-account',
  templateUrl: './view-account.component.html',
  styleUrls: ['./view-account.component.scss']
})
export class ViewAccountComponent extends UnsubOnDestroy {
  public account$!: Observable<IAccountEntity>;

  constructor(public route: ActivatedRoute, public service: AccountService, private nt: NotificationService,
    public ut: UtilityService, public pr: PrivilegeService, public display: DisplayService, private childService: ChildService) { super(); }

  ngOnInit(): void {
    let accountId = +(this.route.snapshot.paramMap.get('id') ?? 'null');

    if (Number.isInteger(accountId))
      this.account$ = this.service.fetchOne(accountId,true).pipe(
        catchError(() => {
          this.ut.isLoading.next(false);
          this.nt.errorDefaultDialog("Sorry, there was a problem fetching the account information. Please try again later or check your connection.");
          this.ut.router.navigateByUrl('404');
          return EMPTY;
        }));
    else {
      this.ut.isLoading.next(false);
      this.nt.errorDefaultDialog("Sorry, there was a problem fetching the account information. Please try again later or check your connection.");
      this.ut.router.navigateByUrl('404');
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
}
