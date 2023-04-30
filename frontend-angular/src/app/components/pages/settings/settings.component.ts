import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { UtilityService } from 'src/app/services/utility.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent {
  // public language: 'Arabic' | 'English' = this.translate.currentLang == 'ar' ? 'English' : 'Arabic';

  constructor(public translate: TranslateService, public ut:UtilityService) { }


}
