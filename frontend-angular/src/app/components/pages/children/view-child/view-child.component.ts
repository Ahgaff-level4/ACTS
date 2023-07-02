import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IChildEntity } from '../../../../../../../interfaces';
import { ChildService } from 'src/app/services/CRUD/child.service';
import { UtilityService } from 'src/app/services/utility.service';
import { UnsubOnDestroy } from 'src/app/unsub-on-destroy';
import { NotificationService } from 'src/app/services/notification.service';
import { PrivilegeService } from 'src/app/services/privilege.service';

@Component({
  selector: 'app-view-child',
  templateUrl: './view-child.component.html',
  styleUrls: ['./view-child.component.scss']
})
export class ViewChildComponent extends UnsubOnDestroy implements OnInit, OnDestroy {

  public child: IChildEntity | undefined;
  constructor(private route: ActivatedRoute, private service: ChildService,
    private ut: UtilityService, private nt: NotificationService,
    public pr: PrivilegeService) { super(); }

  ngOnInit(): void {
    this.ut.isLoading.next(true);
    this.sub.add(this.route.paramMap.subscribe({
      next: async params => {
        let childId = params.get('id');
        if (childId != null && typeof (+childId) == 'number')
          this.sub.add(this.service.children$.subscribe(async v => {
            this.child = v.find(v => v.id == +childId!)
            if (!this.child)
              this.nt.notify(null);
          }));
        else this.nt.errorDefaultDialog("Sorry, there was a problem fetching the children information. Please try again later or check your connection.");
        this.ut.isLoading.next(false);
      }, error: () => this.ut.isLoading.next(false)
    }));
  }

}
