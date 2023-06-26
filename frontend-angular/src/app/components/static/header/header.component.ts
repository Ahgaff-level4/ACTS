import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LoginService } from 'src/app/services/login.service';
import { PrivilegeService } from 'src/app/services/privilege.service';
import { UtilityService } from 'src/app/services/utility.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent  {
  public isShowDivIf = true;
  public language: 'Arabic' | 'English' = this.translate.currentLang == 'ar' ? 'English' : 'Arabic';
  constructor(public ut: UtilityService, public pr: PrivilegeService, public loginService: LoginService, public translate: TranslateService,) {
  }


  changeLang() {
    if (this.language == 'Arabic')
      this.translate.use('ar');
    else this.translate.use('en');
    this.language = this.language == 'Arabic' ? 'English' : 'Arabic';
  }

}
