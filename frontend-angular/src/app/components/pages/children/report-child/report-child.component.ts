import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, Observable, combineLatest, filter, interval, map, tap, throttleTime } from 'rxjs';
import { ReportService, } from 'src/app/services/report.service';
import { CustomTimeframe, IChildReport, IFieldEntity } from '../../../../../../../interfaces';
import { DisplayService } from 'src/app/services/display.service';
import { UnsubOnDestroy } from 'src/app/unsub-on-destroy';
import { FormControl, FormGroup } from '@angular/forms';
import { FieldService } from 'src/app/services/CRUD/field.service';
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
    return [{ name: this.display.translate('Completed'), value: v!.goal.completedCount },
    { name: this.display.translate('Continual'), value: v!.goal.continualCount }];
  }));

  public activitiesFieldsPolar$: Observable<{ name: string, series: { name: string, value: number }[] }[]> = combineLatest(
    [this.childReport$.pipe(filter(v => v != null)),
    this.fieldService.fields$]
  ).pipe(map((v) => {
    const report: IChildReport = v[0] as IChildReport;
    const fields: IFieldEntity[] = v[1];
    return [{
      name: this.display.translate('Completed goals'), series: fields.map(f => ({
        name: f.name,
        value: report.goal.goals.filter(g => g.state == 'completed' && g.activity.fieldId == f.id).length
      }))
    }, {
      name: this.display.translate('Continual goals'), series: fields.map(f => ({
        name: f.name,
        value: report.goal.goals.filter(g => g.state == 'continual' && g.activity.fieldId == f.id).length,
      }))
    }, {
      name: this.display.translate('Strengths activities'), series: fields.map(f => ({
        name: f.name,
        value: report.strength.strengths.filter(s => s.activity.fieldId == f.id).length
      }))
    }]
  }));

  public evaluationsChartData$: Observable<{ name: string, series: { value: number, name: Date | string }[] }[]> = this.childReport$.pipe(filter(v => v != null), map((v) => {
    v!.evaluation.evaluations = v!.evaluation.evaluations.sort((a, b) => a.evaluationDatetime < b.evaluationDatetime ? 1 : (a.evaluationDatetime > b.evaluationDatetime ? -1 : 0))
    const excellentEvaluations = v!.evaluation.evaluations.filter(e => e.rate == 'excellent');
    const continualEvaluations = v!.evaluation.evaluations.filter(e => e.rate == 'continual');
    return [{
      name: this.display.translate('Excellent'), series: excellentEvaluations
        .map((v, i) => ({ value: excellentEvaluations.length - i, name: new Date(v.evaluationDatetime) }))
    },
    {
      name: this.display.translate('Continual'), series: continualEvaluations
        .map((v, i) => ({ value: continualEvaluations.length - i, name: new Date(v.evaluationDatetime) }))
    },
    ];
  }));

  public goalsStrengthsChartData$: Observable<{ name: string, series: { value: number, name: Date | string }[] }[]> = this.childReport$.pipe(filter(v => v != null), map((v) => {
    v!.goal.goals = v!.goal.goals.sort((a, b) => a.assignDatetime < b.assignDatetime ? 1 : (a.assignDatetime > b.assignDatetime ? -1 : 0))
    v!.strength.strengths = v!.strength.strengths.sort((a, b) => a.assignDatetime < b.assignDatetime ? 1 : (a.assignDatetime > b.assignDatetime ? -1 : 0))
    const completedGoals = v!.goal.goals.filter(e => e.state == 'completed');
    const continualGoals = v!.goal.goals.filter(e => e.state == 'continual');
    const strengths = v!.strength.strengths;
    return [{
      name: this.display.translate('Completed goal'), series: completedGoals
        .map((v, i) => ({ value: completedGoals.length - i, name: new Date(v.assignDatetime) }))
    },
    {
      name: this.display.translate('Continual goal'), series: continualGoals
        .map((v, i) => ({ value: continualGoals.length - i, name: new Date(v.assignDatetime) }))
    },
    {
      name: this.display.translate('Strength'), series: strengths
        .map((v, i) => ({ value: strengths.length - i, name: new Date(v.assignDatetime) }))
    },
    ];
  }));


  public timeframeFormGroup = new FormGroup({
    from: new FormControl<Date>(new Date(new Date().getFullYear() + '-' + (new Date().getMonth() + 1).toString().padStart(2, '0') + '-01')),//current date at day one. Ex:'2023-06-17' => '2023-06-01'
    to: new FormControl<Date>(new Date()),
  });


  constructor(private route: ActivatedRoute, public service: ReportService,
    public display: DisplayService, public fieldService: FieldService,
    private nt: NotificationService, private router: Router,) { super(); }

  ngOnInit(): void {
    //refresh displayed dateTimeWeek every minute
    this.nowDatetime = this.display.toDateTimeWeekPipe.transform(new Date());
    this.sub.add(interval(1000)
      .pipe(filter(() => this.nowDatetime != this.display.toDateTimeWeekPipe.transform(new Date())))
      .subscribe(() => this.nowDatetime = this.display.toDateTimeWeekPipe.transform(new Date()))
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
          this.router.navigateByUrl('/404');
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
        .pipe(tap(v => this.childReport$.next(v)), tap(v => console.log(v))).subscribe();

  }


  printHandle() {
    this.isPrinting = true;
    setTimeout(() => {
      print();
      this.isPrinting = false
    }, 1000);
  }

  xAxisTickFormatting = (v?: any) => {
    return this.display.fromNowPipe.transform(v)
  }
}
