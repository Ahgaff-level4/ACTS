import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LoginService } from 'src/app/services/login.service';
import { PrivilegeService } from 'src/app/services/privilege.service';
import { DisplayService } from 'src/app/services/display.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent  {
  public isShowDivIf = true;
  public language: 'Arabic' | 'English' = this.translate.currentLang == 'ar' ? 'English' : 'Arabic';
  constructor(public display: DisplayService, public pr: PrivilegeService, public router:Router,
    public loginService: LoginService, public translate: TranslateService,) {
  }


  changeLang() {
    if (this.language == 'Arabic')
      this.translate.use('ar');
    else this.translate.use('en');
    this.language = this.language == 'Arabic' ? 'English' : 'Arabic';
  }

}
