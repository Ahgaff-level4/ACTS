import { Component, Input } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(public translate: TranslateService) {
    // Register translation languages
    translate.addLangs(['en', 'ar']);
    
    // Set default language
    translate.setDefaultLang('en');
  }
}
