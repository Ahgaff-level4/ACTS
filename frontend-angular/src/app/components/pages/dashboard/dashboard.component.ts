import { Component } from '@angular/core';
import { IDashboard, Timeframe } from '../../../../../../interfaces';
import { BehaviorSubject, Observable, filter, map } from 'rxjs';
import { UnsubOnDestroy } from 'src/app/unsub-on-destroy';
import { ReportService } from 'src/app/services/report.service';
import { UtilityService } from 'src/app/services/utility.service';
import { DisplayService } from 'src/app/services/display.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent extends UnsubOnDestroy {
  public dashboard$ = new BehaviorSubject<IDashboard | null>(null);
  public childrenRegisterData$: Observable<[{ name: string, series: { value: number, name: Date | string }[] }]> = this.dashboard$.pipe(filter(v => v != null), map(v => {
    let i = v!.childrenCount;
    const ret = [{
      name: this.ut.translate('Number of Children'), series: v!.children
        .sort((a, b) => a.person.createdDatetime < b.person.createdDatetime ? 1 : (a.person.createdDatetime > b.person.createdDatetime ? -1 : 0))
        .map((v) => ({ value: i--, name: new Date(v.person.createdDatetime) }))
    }] as any;
    return ret;
  }))
  constructor(public service: ReportService, public ut: UtilityService, public display: DisplayService) { super(); }

  ngOnInit() {
    this.sub.add(this.service.fetchDashboard().subscribe(v => this.dashboard$.next(v)));
  }

  updateChart(timeframe: Timeframe) {
    if (this.dashboard$.value) {
      this.sub.add(this.service.fetchDashboard({ timeframe })
        .subscribe(v => {
          this.dashboard$.next(v);
        }));
    }
  }

  xAxisTickFormatting = (v?: any) => {
    return this.display.fromNow(v, true)
  }
}
