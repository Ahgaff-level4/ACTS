import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { CustomTimeframe, TimeframeDuration } from '../../../../../../interfaces';
import { MatDateRangePicker } from '@angular/material/datepicker';
import * as moment from 'moment';

@Component({
  selector: 'app-timeframe[timeframeFormGroup]',
  templateUrl: './timeframe.component.html',
  styleUrls: ['./timeframe.component.scss']
})
export class TimeframeComponent {
  public now = new Date();
  @Input() timeframeFormGroup!: FormGroup<{
    from: FormControl<Date | null>;
    to: FormControl<Date | null>;
  }>;
  // @ViewChild('picker10') picker10!: MatDateRangePicker<moment.Moment>;

  setTimeframe(t: TimeframeDuration) {
    this.now = new Date();
    if (t == 'All Time') {
      this.timeframeFormGroup.controls.from.setValue(new Date(0));
      this.timeframeFormGroup.controls.to.setValue(this.now);
    } else if (t == 'Yearly') {
      this.timeframeFormGroup.controls.from.setValue(new Date(this.now.getFullYear() - 1, this.now.getMonth(), this.now.getDate()));
      this.timeframeFormGroup.controls.to.setValue(this.now);
    } else if (t == 'Monthly') {
      this.timeframeFormGroup.controls.from.setValue(new Date(this.now.getFullYear(), this.now.getMonth() - 1, this.now.getDate()));
      this.timeframeFormGroup.controls.to.setValue(this.now);
    } else if (t == 'Weekly') {
      this.timeframeFormGroup.controls.from.setValue(new Date(this.now.getTime() - 7 * 24 * 60 * 60 * 1000));
      this.timeframeFormGroup.controls.to.setValue(this.now);
    }
  }

  chosenTimeframe(): TimeframeDuration | '' {
    //todo add hint of the chosen timeframe if not custom
    return '';
  }
}
