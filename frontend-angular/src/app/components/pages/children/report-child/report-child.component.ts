import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { ReportService, } from 'src/app/services/report.service';
import { IChildReport, Timeframe } from '../../../../../../../interfaces';
import { UtilityService } from 'src/app/services/utility.service';
import { AgChartOptions, AgDoughnutInnerLabel, AgPolarSeriesOptions } from 'ag-charts-community';

@Component({
  selector: 'app-report-child',
  templateUrl: './report-child.component.html',
  styleUrls: ['./report-child.component.scss']
})
export class ReportChildComponent implements OnInit, OnDestroy {
  public sub: Subscription = new Subscription();
  public childReport$ = new BehaviorSubject<IChildReport | null>(null);
  public options!: AgChartOptions;

  constructor(private route: ActivatedRoute, public service: ReportService, private ut: UtilityService) { }

  ngOnInit(): void {

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

    this.sub.add(this.childReport$.subscribe((v) => {
      if (v == null) return;
      this.options.data[0].count = v.goal.completeCount;
      this.options.data[1].count = v.goal.continualCount;
      ((this.options.series?.[0] as AgPolarSeriesOptions).innerLabels?.[0] as AgDoughnutInnerLabel).text = v.goal.completeCount + v.goal.continualCount + '';
      this.options = { ...this.options };
    }));

    this.options = {
      autoSize: true,
      data: [
        { type: this.ut.translate('Complete'), },
        { type: this.ut.translate('Continual'), },
      ],
      title: {
        text: 'Goals',
        fontSize: 20,
        spacing: 25,
      },
      series: [
        {
          type: 'pie',
          calloutLabelKey: 'type',
          strokeWidth: 0,
          angleKey: 'count',
          sectorLabelKey: 'count',
          calloutLabel: {
            enabled: false,
          },
          sectorLabel: {
            color: 'white',
            // fontWeight: 'bold',
            formatter: (param) => {
              // const value = datum[calloutLabelKey!];
              // console.log(param,);
              return param.datum.type;
            },
          },
          // title: {
          //   text: 'Godals',
          // },
          fills: [
            '#198754',
            '#ffc107',
          ],
          innerRadiusRatio: 0.5,
          innerLabels: [
            {
              text: '',//total count
              fontSize: 24,
              fontWeight: 'bold',
            },
            {
              text: this.ut.translate('Total'),
              fontSize: 16,
            },
          ],
          highlightStyle: {
            item: {
              fillOpacity: 0.2,
              stroke: '#000',
              strokeWidth: 0.5,
            },
          },
          tooltip: {
            renderer: ({ datum, calloutLabelKey, title, sectorLabelKey }) => {
              return {
                // title,
                content: `${datum[sectorLabelKey!]} ${datum[calloutLabelKey!]} goals`,
              };
            },
          },
        },
      ],
    }
  }


  updateGoalChart(timeframe:Timeframe) {
    if (this.childReport$.value) {
      this.sub.add(this.service.fetchChildReport(this.childReport$.value.child.id, { timeframe })
        .subscribe(v => {
          this.childReport$.next(v);
          console.log('updated',v);
        }));
    }
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
