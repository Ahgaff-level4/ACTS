import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-entity-item',
  templateUrl: './entity-item.component.html',
  styleUrls: ['./entity-item.component.scss']
})
export class EntityItemComponent {
  @Input() titleText!: string;
  @Input() content?: string;
  @Input() link?:string;//if link undefined the link button won't shown
  @Input() linkTooltip?:string;

}
