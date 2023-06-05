import { Component, Input } from '@angular/core';
import { IChildEntity } from '../../../../../../../../interfaces';
import { UtilityService } from 'src/app/services/utility.service';

@Component({
  selector: 'app-child-info',
  templateUrl: './child-info.component.html',
  styleUrls: ['./child-info.component.scss']
})
export class ChildInfoComponent {

  @Input('child') public child: IChildEntity | undefined;
  @Input('isPrinting') public isPrinting:boolean = false;
  constructor(public ut: UtilityService) { }
}
