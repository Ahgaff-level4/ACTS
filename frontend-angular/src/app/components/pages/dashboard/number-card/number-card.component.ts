import { Component, Input } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { DisplayService } from 'src/app/services/display.service';

@Component({
  selector: 'app-number-card[src][alt][content][number][timeframe]',
  templateUrl: './number-card.component.html',
  styleUrls: ['./number-card.component.scss']
})
export class NumberCardComponent {
  @Input() src!: string;
  @Input() alt!: string;
  @Input() content!: string;
  @Input() number!: number;
  @Input() timeframe!: FormGroup<{
    from: FormControl<Date | null>;
    to: FormControl<Date | null>;
  }>
  
}
