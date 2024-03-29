import { Component, Input } from '@angular/core';
import { IPersonEntity } from '../../../../../../interfaces';
import { DisplayService } from 'src/app/services/display.service';

@Component({
  selector: 'app-person-view[person]',
  templateUrl: './person-view.component.html',
  styleUrls: ['./person-view.component.scss']
})
export class PersonViewComponent {
  @Input() person!: IPersonEntity;

}
