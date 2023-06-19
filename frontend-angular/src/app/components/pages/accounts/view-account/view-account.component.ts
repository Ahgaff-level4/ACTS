import { Component } from '@angular/core';
import { IAccountEntity } from '../../../../../../../interfaces';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { AccountService } from 'src/app/services/CRUD/account.service';
import { UtilityService } from 'src/app/services/utility.service';
import { UnsubOnDestroy } from 'src/app/unsub-on-destroy';
import { PrivilegeService } from 'src/app/services/privilege.service';

@Component({
  selector: 'app-view-account',
  templateUrl: './view-account.component.html',
  styleUrls: ['./view-account.component.scss']
})
export class ViewAccountComponent extends UnsubOnDestroy {
  public account: IAccountEntity | undefined;
  constructor(private route: ActivatedRoute, public service: AccountService,
    public ut: UtilityService, public pr: PrivilegeService) { super(); }

  ngOnInit(): void {
    this.ut.isLoading.next(true);
    this.sub.add(this.route.paramMap.subscribe({
      next: async params => {
        let accountId = params.get('id');
        if (accountId != null && typeof (+accountId) == 'number')
          this.sub.add(this.service.accounts.subscribe(async v => {
            this.account = v.find(v => v.id == +accountId!)
            if (!this.account)
              this.ut.notify(null);
          }));
        else this.ut.errorDefaultDialog("Sorry, there was a problem fetching the accounts information. Please try again later or check your connection.");
        this.ut.isLoading.next(false);
      }, error: () => this.ut.isLoading.next(false)
    }));
  }
}
