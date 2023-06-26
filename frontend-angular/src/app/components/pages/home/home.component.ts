import { Component, OnInit } from '@angular/core';
import { Privilege, PrivilegeService } from 'src/app/services/privilege.service';
import { IPage, PAGES } from 'src/app/services/utility.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  constructor(public pr: PrivilegeService) { }

}

