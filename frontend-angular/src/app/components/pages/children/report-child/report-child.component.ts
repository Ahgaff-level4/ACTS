import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { ReportService } from 'src/app/services/report.service';
import { IChildReport } from '../../../../../../../interfaces';
import { UtilityService } from 'src/app/services/utility.service';

@Component({
  selector: 'app-report-child',
  templateUrl: './report-child.component.html',
  styleUrls: ['./report-child.component.scss']
})
export class ReportChildComponent implements OnInit, OnDestroy {
  public sub: Subscription = new Subscription();
  public childReport!:Observable<IChildReport>

  constructor(private route: ActivatedRoute,public service:ReportService,private ut:UtilityService){}

  ngOnInit(): void {
    this.sub.add(this.route.paramMap.subscribe({
      next: async params => {
        let childId = params.get('id');
        if (typeof childId == 'string')
          this.childReport = this.service.fetchChildReport(+childId);
        else this.ut.errorDefaultDialog(undefined, "Sorry, there was a problem fetching the child's report. Please try again later or check your connection.")
      },
    }));
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
