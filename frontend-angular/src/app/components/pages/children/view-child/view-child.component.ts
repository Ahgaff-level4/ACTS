import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IChildEntity } from '../../../../../../../interfaces';
import { ChildService } from 'src/app/services/CRUD/child.service';
import { DisplayService } from 'src/app/services/display.service';
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
    private display: DisplayService, private nt: NotificationService,
    public pr: PrivilegeService) { super(); }

  ngOnInit(): void {
    this.display.isLoading.next(true);
    let childId = this.route.snapshot.paramMap.get('id');
    if (childId != null && typeof (+childId) == 'number')
      this.sub.add(this.service.children$.subscribe(async v => {
        this.display.isLoading.next(false);
        this.child = v.find(v => v.id == +childId!)
        if (!this.child)
          this.nt.notify(null);
      }));
    else {
      this.nt.errorDefaultDialog("Sorry, there was a problem fetching the children information. Please try again later or check your connection.");
      this.display.isLoading.next(false);
    }
  }

}
