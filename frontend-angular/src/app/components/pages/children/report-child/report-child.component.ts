import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, Observable, combineLatest, filter, interval, map, tap, throttleTime } from 'rxjs';
import { ReportService, } from 'src/app/services/report.service';
import { CustomTimeframe, IChildReport, IFieldEntity } from '../../../../../../../interfaces';
import { UtilityService } from 'src/app/services/utility.service';
import { UnsubOnDestroy } from 'src/app/unsub-on-destroy';
import { FormControl, FormGroup } from '@angular/forms';
import { FieldService } from 'src/app/services/CRUD/field.service';
import { DisplayService } from 'src/app/services/display.service';
import { NotificationService } from 'src/app/services/notification.service';
@Component({
  selector: 'app-report-child',
  templateUrl: './report-child.component.html',
  styleUrls: ['./report-child.component.scss']
})
export class ReportChildComponent extends UnsubOnDestroy implements OnInit, OnDestroy {
  public childReport$ = new BehaviorSubject<IChildReport | null>(null);
  /**Displayed Date Time Week */
  public nowDatetime = '';
  public isPrinting = false;
  public goalsStatePieData$: Observable<{ name: string, value: number }[]> = this.childReport$.pipe(filter(v => v != null), map((v) => {
    return [{ name: this.ut.translate('Completed'), value: v!.goal.completedCount },
    { name: this.ut.translate('Continual'), value: v!.goal.continualCount }];
  }));

  public activitiesFieldsPolar$: Observable<{ name: string, series: { name: string, value: number }[] }[]> = combineLatest(
    [this.childReport$.pipe(filter(v => v != null)),
    this.fieldService.fields$]
  ).pipe(map((v) => {
    const report: IChildReport = v[0] as IChildReport;
    const fields: IFieldEntity[] = v[1];
    return [{
      name: this.ut.translate('Completed goals'), series: fields.map(f => ({
        name: f.name,
        value: report.goalStrength.goals.filter(g => g.state == 'completed' && g.activity.fieldId == f.id).length
      }))
    }, {
      name: this.ut.translate('Continual goals'), series: fields.map(f => ({
        name: f.name,
        value: report.goalStrength.goals.filter(g => g.state == 'continual' && g.activity.fieldId == f.id).length,
      }))
    }, {
      name: this.ut.translate('Strengths activities'), series: fields.map(f => ({
        name: f.name,
        value: report.goalStrength.strengths.filter(s => s.activity.fieldId == f.id).length
      }))
    }]
  }))

  public timeframeFormGroup = new FormGroup({
    from: new FormControl<Date>(new Date(new Date().getFullYear() + '-' + (new Date().getMonth() + 1).toString().padStart(2, '0') + '-01')),//current date at day one. Ex:'2023-06-17' => '2023-06-01'
    to: new FormControl<Date>(new Date()),
  });


  constructor(private route: ActivatedRoute, public service: ReportService,
    public ut: UtilityService, public fieldService: FieldService, private nt: NotificationService,
    public display: DisplayService) { super(); }

  ngOnInit(): void {
    //refresh every minute
    this.nowDatetime = this.display.toDateTimeWeek(new Date());
    this.sub.add(interval(1000)
      .pipe(filter(() => this.nowDatetime != this.display.toDateTimeWeek(new Date())))
      .subscribe(() => this.nowDatetime = this.display.toDateTimeWeek(new Date()))
    );


    this.sub.add(this.timeframeFormGroup.valueChanges.pipe(throttleTime(300, undefined, { leading: false, trailing: true })).subscribe(v => {
      if (this.childReport$.value && v.to && v.from && this.timeframeFormGroup.valid && v.from < v.to)
        this.updateReport({ to: v.to, from: v.from });
      else this.nt.notify('Invalid Field', 'Invalid date range', 'error')
    }));

    this.sub.add(this.route.paramMap.subscribe({
      next: async params => {
        let childId = params.get('id');
        if (typeof childId == 'string')
          this.service.fetchChildReport(+childId).pipe(tap(v => this.childReport$.next(v))).subscribe();
        else {
          this.nt.errorDefaultDialog(undefined, "Sorry, there was a problem fetching the child's report. Please try again later or check your connection.");
          this.ut.router.navigateByUrl('/404');
        }
      },
    }));
  }

  updateReport(timeframe?: CustomTimeframe) {
    if (!timeframe)
      timeframe = {
        from: this.timeframeFormGroup.controls.from.value!.toString(),
        to: this.timeframeFormGroup.controls.to.value!.toString()
      };
    if (this.childReport$.value)
      this.service.fetchChildReport(this.childReport$.value.child.id, timeframe)
        .pipe(tap(v => this.childReport$.next(v)),tap(v=>console.log(v))).subscribe();

  }


  printHandle() {
    this.isPrinting = true;
    setTimeout(() => {
      print();
      this.isPrinting = false
    }, 1000);
  }

  stringify = (v: any) => v + '';


}
