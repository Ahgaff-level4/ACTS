import { Component } from '@angular/core';
import { CustomTimeframe, IDashboard, TimeframeDuration } from '../../../../../../interfaces';
import { BehaviorSubject, Observable, filter, map, throttleTime } from 'rxjs';
import { UnsubOnDestroy } from 'src/app/unsub-on-destroy';
import { ReportService } from 'src/app/services/report.service';
import { DisplayService } from 'src/app/services/display.service';
import { FormControl, FormGroup } from '@angular/forms';
import { NotificationService } from 'src/app/services/notification.service';
import { PrivilegeService } from 'src/app/services/privilege.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent extends UnsubOnDestroy {
  public dashboard$ = new BehaviorSubject<IDashboard | null>(null);
  public childrenRegisterData$: Observable<[{ name: string, series: { value: number, name: Date | string }[] }]> = this.dashboard$.pipe(filter(v => v != null), map(v => {
    return [{
      name: this.display.translate('Number of Children'), series: v!.children
        .sort((a, b) => a.person.createdDatetime < b.person.createdDatetime ? 1 : (a.person.createdDatetime > b.person.createdDatetime ? -1 : 0))
        .map((c, i) => ({ value: v!.childrenArchiveCount + v!.childrenNotArchiveCount - i, name: new Date(c.person.createdDatetime) }))
    }];
  }));

  public numberCardsData$: Observable<IDashboard['counts']> = this.dashboard$.pipe(filter(v => v != null), map(dashboard => {
    return dashboard!.counts;
  }));

  public timeframeFormGroup = new FormGroup({
    from: new FormControl<Date>(new Date(new Date().getFullYear() - 1, new Date().getMonth(), new Date().getDate())),//Default Yearly
    to: new FormControl<Date>(new Date()),
  });
  constructor(public service: ReportService, private display: DisplayService,
    private nt: NotificationService, public pr: PrivilegeService) { super(); }

  ngOnInit() {
    this.sub.add(this.service.fetchDashboard({
      from: this.timeframeFormGroup.controls.from.value!.toString(),
      to: this.timeframeFormGroup.controls.to.value!.toString()
    }).subscribe(v => this.dashboard$.next(v)));

    this.sub.add(this.timeframeFormGroup.valueChanges.pipe(throttleTime(300, undefined, { leading: false, trailing: true })).subscribe(v => {
      if (v.to && v.from && this.timeframeFormGroup.valid && v.from < v.to)
        this.updateDashboard({ to: v.to, from: v.from });
      else this.nt.notify('Invalid Field', 'Invalid date range', 'error')
    }));
  }

  updateDashboard(timeframe?: CustomTimeframe) {
    if (!timeframe)
      timeframe = {
        from: this.timeframeFormGroup.controls.from.value!.toString(),
        to: this.timeframeFormGroup.controls.to.value!.toString()
      };
    if (this.dashboard$.value) {
      this.sub.add(this.service.fetchDashboard(timeframe)
        .subscribe(v => {
          this.dashboard$.next(v);
        }));
    }
  }

  xAxisTickFormatting = (v?: any) => {
    return this.display.fromNowPipe.transform(v)
  }

  printHandle() {
    //apply a css @media print that will hide everything in <body> unless it has `.printable` class
    document.body.classList.add('print');
    print()
    document.body.classList.remove('print')
  }
}
