import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LoginService } from 'src/app/services/login.service';
import { UtilityService } from 'src/app/services/utility.service';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss']
})
export class NavBarComponent implements OnInit {
  constructor(private ut: UtilityService, public loginService: LoginService, public translate: TranslateService) { }

  ngOnInit(): void {
    this.ut.user.subscribe((v) => {
      this.isLoggedIn = v?.isLoggedIn ?? false;
    });
  }

  changeLang() {
    if (this.language == 'Arabic')
      this.translate.use('ar');
    else this.translate.use('en');
    this.language = this.language == 'Arabic' ? 'English' : 'Arabic';
  }

  public language: 'Arabic' | 'English' = this.translate.currentLang == 'ar' ? 'English' : 'Arabic';
  public isLoggedIn: boolean = false;
}
