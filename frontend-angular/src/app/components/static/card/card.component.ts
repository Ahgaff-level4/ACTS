import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})
export class CardComponent {
  @Input('cardTitle') title: string | undefined;
  @Input() id: string | undefined;
  @Input() padding: boolean = true;
}
