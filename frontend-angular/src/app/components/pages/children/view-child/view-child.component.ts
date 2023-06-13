import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IChildEntity } from '../../../../../../../interfaces';
import { ChildService } from 'src/app/services/child.service';
import { Subscription } from 'rxjs';
import { UtilityService } from 'src/app/services/utility.service';

@Component({
  selector: 'app-view-child',
  templateUrl: './view-child.component.html',
  styleUrls: ['./view-child.component.scss']
})
export class ViewChildComponent implements OnInit, OnDestroy {

  private sub = new Subscription();
  public child: IChildEntity | undefined;
  constructor(private route: ActivatedRoute, private service: ChildService, private ut: UtilityService) { }

  ngOnInit(): void {
    this.ut.isLoading.next(true);
    this.sub.add(this.route.paramMap.subscribe({
      next: async params => {
        let childId = params.get('id');
        if (childId != null && typeof (+childId) == 'number')
          this.sub.add(this.service.children$.subscribe(async v => {
            this.child = v.find(v => v.id == +childId!)
            if (!this.child)
              this.ut.notify(null);
          }));
        else this.ut.errorDefaultDialog("Sorry, there was a problem fetching the children information. Please try again later or check your connection.");
        this.ut.isLoading.next(false);
      }, error: () => this.ut.isLoading.next(false)
    }));
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
