import { Component, Input } from '@angular/core';
import { IChildEntity } from '../../../../../../../../interfaces';
import { DisplayService } from 'src/app/services/display.service';
import { PrivilegeService } from 'src/app/services/privilege.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-child-info',
  templateUrl: './child-info.component.html',
  styleUrls: ['./child-info.component.scss']
})
export class ChildInfoComponent {

  @Input() hideReport: boolean = false;//used when Child Report page use this component.
  @Input('child') public child: IChildEntity | undefined;
  @Input('isPrinting') public isPrinting: boolean = false;
  constructor(public display: DisplayService, public pr: PrivilegeService, public router: Router,
    public route: ActivatedRoute) { }
}
