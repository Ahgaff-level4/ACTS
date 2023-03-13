import { Component, OnInit } from '@angular/core';
import { LoginService } from 'src/app/services/login.service';
import { UtilityService } from 'src/app/services/utility.service';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss']
})
export class NavBarComponent implements OnInit {
  constructor(private ut: UtilityService, public loginService: LoginService) { }

  ngOnInit(): void {
    this.ut.user.subscribe((v) => {
      this.isLoggedIn = v?.isLoggedIn ?? false;
    });
  }

  public isLoggedIn: boolean = false;
}
