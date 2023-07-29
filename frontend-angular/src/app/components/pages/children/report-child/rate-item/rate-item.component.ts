import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-rate-item',
  templateUrl: './rate-item.component.html',
  styleUrls: ['./rate-item.component.scss']
})
export class RateItemComponent {
  @Input() header: string | number = '';
  @Input() rate: { newRate: number, oldRate: number } | undefined;
  @Input() changeRateTooltip: string = '';
  @Input() description: string = '';
  @Input() descriptionTooltip: string = '';

  changeRate() {
    if (this.rate)
      return this.rate.oldRate == 0 ? 0 : (this.rate.newRate - this.rate.oldRate) / this.rate.oldRate * 100;
    return undefined;
  }
}
