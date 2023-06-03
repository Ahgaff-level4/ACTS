import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
import { NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { Subscription } from 'rxjs';
import { SocketService } from 'src/app/services/socket.service';
import { UtilityService } from 'src/app/services/utility.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  private sub: Subscription = new Subscription();
  public isLoading: boolean = true;
  constructor(public translate: TranslateService, private websocket: SocketService, private ut: UtilityService, private dateAdapter: DateAdapter<moment.Moment>, private router: Router) {
  }

  ngOnInit() {
    this.ut.user.subscribe(v => v && this.websocket.connect(v));//just to initialize it.
    // Register translation languages
    this.translate.addLangs(['en', 'ar']);
    this.translate.setDefaultLang('en');
    this.translate.use(localStorage.getItem('lang') === 'ar' ? 'ar' : 'en');//in the constructor to speed up language used
    this.sub.add(this.translate.onLangChange.subscribe(() => this.handleOnLangChange()));
    this.router.events.subscribe({
      next: (event) => {
        if (event instanceof NavigationStart)
          this.ut.isLoading.next(true)
        else if (event instanceof NavigationEnd || event instanceof NavigationCancel || event instanceof NavigationError)
          this.ut.isLoading.next(false);
      }, error: () => this.ut.isLoading.next(false)
    });

    this.sub.add(this.ut.isLoading.subscribe(v => this.isLoading = v));
    this.handleOnLangChange();
    var isRememberMe: 'true' | 'false' = localStorage.getItem('isRememberMe') as 'true' | 'false';
    if (this.ut.user.value == null && isRememberMe !== 'false')
      this.ut.isLogin().finally(() => console.log('isLogin:', this.ut.user.value));
  }

  handleOnLangChange = async () => {
    const currentLang = this.translate.currentLang;
    moment.locale(currentLang === 'ar' ? 'ar-ly' : 'en-gb');
    this.dateAdapter.setLocale(currentLang === 'ar' ? 'ar-ly' : 'en-gb');
    document.documentElement.lang = currentLang;
    document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
    localStorage.setItem('lang', currentLang);
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

}
