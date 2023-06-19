import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LoginService } from 'src/app/services/login.service';
import { PrivilegeService } from 'src/app/services/privilege.service';
import { UtilityService } from 'src/app/services/utility.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  public isShowDivIf = true;
  public language: 'Arabic' | 'English' = this.translate.currentLang == 'ar' ? 'English' : 'Arabic';
  public isLoggedIn: boolean = false;

  constructor(public ut: UtilityService, public loginService: LoginService, public translate: TranslateService, public pr:PrivilegeService) {
  }

  ngOnInit(): void {
    this.ut.user.subscribe((v) => {
      console.log('header user is object', !!v)
      this.isLoggedIn = v?.isLoggedIn ?? false;
    });
  }

  changeLang() {
    if (this.language == 'Arabic')
      this.translate.use('ar');
    else this.translate.use('en');
    this.language = this.language == 'Arabic' ? 'English' : 'Arabic';
  }

}
