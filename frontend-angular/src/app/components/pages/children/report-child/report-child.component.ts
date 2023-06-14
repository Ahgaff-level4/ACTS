import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, Observable, filter, interval, map } from 'rxjs';
import { ReportService, } from 'src/app/services/report.service';
import { IChildReport, Timeframe } from '../../../../../../../interfaces';
import { UtilityService } from 'src/app/services/utility.service';
import { UnsubOnDestroy } from 'src/app/unsub-on-destroy';
import { Color, ScaleType } from '@swimlane/ngx-charts';
@Component({
  selector: 'app-report-child',
  templateUrl: './report-child.component.html',
  styleUrls: ['./report-child.component.scss']
})
export class ReportChildComponent extends UnsubOnDestroy implements OnInit, OnDestroy {
  public childReport$ = new BehaviorSubject<IChildReport | null>(null);
  public nowDatetime = '';
  public isPrinting = false;
  public rowData: Observable<{ name: string, value: number }[]> = this.childReport$.pipe(filter(v => v != null), map((v) => {
    return [{ name: this.ut.translate('Completed'), value: v!.goal.completedCount },
    { name: this.ut.translate('Continual'), value: v!.goal.continualCount }];
  }))
  public colorScheme: Color = {
    name: 'myColor',
    selectable: false,
    group: ScaleType.Time,
    domain: ['#318c63',
      '#f3c900',],
  };
  constructor(private route: ActivatedRoute, public service: ReportService, public ut: UtilityService) { super(); }

  ngOnInit(): void {
    this.nowDatetime = this.ut.toDateTimeWeek(new Date());
    this.sub.add(interval(1000).pipe(filter(() => this.nowDatetime != this.ut.toDateTimeWeek(new Date()))).subscribe(() => this.nowDatetime = this.ut.toDateTimeWeek(new Date())));
    this.sub.add(this.route.paramMap.subscribe({
      next: async params => {
        let childId = params.get('id');
        if (typeof childId == 'string')
          this.sub.add(this.service.fetchChildReport(+childId).subscribe(v => {
            this.childReport$.next(v);
          }));
        else this.ut.errorDefaultDialog(undefined, "Sorry, there was a problem fetching the child's report. Please try again later or check your connection.")
      },
    }));
  }


  updateGoalChart(timeframe: Timeframe) {
    if (this.childReport$.value) {
      this.sub.add(this.service.fetchChildReport(this.childReport$.value.child.id, { timeframe })
        .subscribe(v => {
          this.childReport$.next(v);
        }));
    }
  }



  printHandle() {
    this.isPrinting = true;
    setTimeout(() => {
      print();
      this.isPrinting = false
    }, 1000);
  }
}
