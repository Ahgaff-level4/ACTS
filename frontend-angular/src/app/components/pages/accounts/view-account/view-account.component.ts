import { Component } from '@angular/core';
import { IAccountEntity, IChildEntity } from '../../../../../../../interfaces';
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
  public links: Observable<TitleLink[]> = new Observable(s => s.next([{ title: 'Accounts', link: '/account' }]));//init
  constructor(private route: ActivatedRoute, public service: AccountService, private nt: NotificationService,
    public ut: UtilityService, public pr: PrivilegeService, public display: DisplayService, private childService: ChildService) { super(); }

  ngOnInit(): void {
    this.ut.isLoading.next(true);
    let obs: Observable<[IAccountEntity, IChildEntity] | [IAccountEntity]> = this.route.paramMap.pipe(map(params => {
      let accountId = +(params.get('id') ?? -1);
      let childId = +(params.get('childId') ?? -1);
      if (accountId > 0)
        if (childId > 0)
          return combineLatest([this.service.fetchOne(accountId), this.childService.children$.pipe(map(v => v.filter(v => v.id == childId)[0]))])
        else
          return combineLatest([this.service.fetchOne(accountId)])
      else throw 'not found';
    }), concatAll(), tap(() => this.ut.isLoading.next(false)),
      catchError(() => {
        this.ut.isLoading.next(false);
        this.nt.errorDefaultDialog("Sorry, there was a problem fetching the account information. Please try again later or check your connection.");
        this.ut.router.navigateByUrl('404');
        return EMPTY;
      }));

    this.account$ = obs.pipe(map(v => v[0]));
    this.links = obs.pipe(map(v => {
      let account: IAccountEntity = v[0];
      let child: IChildEntity | undefined = v[1];
      let links: TitleLink[] = child?.person?.name ? [
        { title: 'Account information', titleLink: account.person.name },
        { title: 'Child Teachers', link: '/child/' + child.id, fragment: 'teachers' },
        { title: 'Child information', titleLink: child.person.name, link: '/child/' + child.id },
        { title: 'Children', link: '/children' }
      ] :
      [{ title: 'Account information', titleLink: account.person?.name },
      { title: 'Accounts', link: '/account' }];
      return links
    }))
  }
}
