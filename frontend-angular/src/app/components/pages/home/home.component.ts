import { Component } from '@angular/core';
import { PrivilegeService } from 'src/app/services/privilege.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  constructor(public pr: PrivilegeService) { }

}

