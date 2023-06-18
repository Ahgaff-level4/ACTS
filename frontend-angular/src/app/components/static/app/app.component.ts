import { animate, animateChild, group, keyframes, query, style, transition, trigger } from '@angular/animations';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
import { NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router, RouterOutlet } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { Subscription } from 'rxjs';
import { SocketService } from 'src/app/services/socket.service';
import { UtilityService } from 'src/app/services/utility.service';
import { UnsubOnDestroy } from 'src/app/unsub-on-destroy';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [trigger('routeAnimations', [
    transition('* => homePage', [

      query('#whiteLayer', [
        style({ minWidth: '100%', minHeight: '100%', opacity: 1 }),
      ]),
      query('#animate-home-header', [
        style({ height: 0, paddingTop: 0, marginTop: 0 }),
      ]),
      group([
        query('#whiteLayer', [
          animate('500ms 1ms ease-out', style({ opacity: 0, marginTop: '90vh' })),
        ]),
        query('#animate-home-header', [
          animate("500ms 1ms ease-out", style({ height: "*", paddingTop: '*', marginTop: '*' }))
        ]),
      ])
    ],),
    transition('* <=> *', [

      query('#whiteLayer', [
        style({ minWidth: '100%', minHeight: '100%', opacity: 1 }),
        animate('500ms 1ms ease-in-out', style({ opacity: 0 })),
      ]),

    ],)
  ])]
})
export class AppComponent extends UnsubOnDestroy {

  public isLoading: boolean = true;
  constructor(public translate: TranslateService, private websocket: SocketService, private ut: UtilityService, private dateAdapter: DateAdapter<moment.Moment>, private router: Router) {
    super()
  }

  async ngOnInit() {
    this.sub.add(this.ut.user.subscribe(v => this.websocket.connect(v)));//just to initialize it.
    // Register translation languages
    this.translate.addLangs(['en', 'ar']);
    this.translate.setDefaultLang('en');
    this.translate.use(localStorage.getItem('lang') === 'ar' ? 'ar' : 'en');//in the constructor to speed up language used
    this.sub.add(this.translate.onLangChange.subscribe(() => this.handleOnLangChange()));
    this.sub.add(this.router.events.subscribe({
      next: (event) => {
        if (event instanceof NavigationStart)
          this.ut.isLoading.next(true)
        else if (event instanceof NavigationEnd || event instanceof NavigationCancel || event instanceof NavigationError)
          this.ut.isLoading.next(false);
      }, error: () => this.ut.isLoading.next(false)
    }));

    this.sub.add(this.ut.isLoading.subscribe(v => this.isLoading = v));
    this.handleOnLangChange();
    var isRememberMe: 'true' | 'false' = localStorage.getItem('isRememberMe') as 'true' | 'false';
    if (this.ut.user.value == null && isRememberMe != 'false')
      this.ut.user.next(await this.ut.isLogin());
  }

  handleOnLangChange = async () => {
    const currentLang = this.translate.currentLang;
    moment.locale(currentLang === 'ar' ? 'ar-ly' : 'en-gb');
    this.dateAdapter.setLocale(currentLang === 'ar' ? 'ar-ly' : 'en-gb');
    document.documentElement.lang = currentLang;
    document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
    localStorage.setItem('lang', currentLang);
  }

  prepareRoute(outlet: RouterOutlet) {
    return outlet && outlet.activatedRouteData && outlet.activatedRouteData['animation'];
  }
}
