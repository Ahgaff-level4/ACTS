import { Component } from '@angular/core';
import { PrivilegeService } from 'src/app/services/privilege.service';
import { UtilityService } from 'src/app/services/utility.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
  constructor(public pr: PrivilegeService, public ut: UtilityService) { }

  getFullYear() {
    return new Date().getFullYear();
  }
}
