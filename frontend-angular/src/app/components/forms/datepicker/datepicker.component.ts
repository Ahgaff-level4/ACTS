import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-datepicker[controlName][formGroup][label]',
  templateUrl: './datepicker.component.html',
  styleUrls: ['./datepicker.component.scss']
})
export class DatepickerComponent {
  @Input() min: Date | undefined | null;
  @Input() max: Date | undefined | null;
  @Input() placeholder: string = '...';
  @Input('controlName') formControlName!: string;
  @Input() formGroup!: FormGroup;
  @Input() label!: string;
  @Input() startView:'month'|'year'|'multi-year' = 'month';
}
