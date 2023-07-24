import { animate, group, query, style, transition, trigger } from '@angular/animations';
import { Component } from '@angular/core';
import { DateAdapter } from '@angular/material/core';
import { RouterOutlet } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { LoginService } from 'src/app/services/login.service';
import { SocketService } from 'src/app/services/socket.service';
import { UnsubOnDestroy } from 'src/app/unsub-on-destroy';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [trigger('routeAnimations', [
    transition('* => homePage', [
      query('#whiteLayer', [
        style({ minWidth: '100%', minHeight: '100%', opacity: 1 }),
        animate('1ms 1ms ease-in-out', style({ opacity: 0 })),
      ]),
      query('#animate-home-header', [
        style({ transform: 'scaleY(0.1)', transformOrigin: 'center top' }),
      ]),
      group([
        query('#animate-home-header', [
          animate("500ms 1ms ease-out", style({ transform: 'scaleY(1)', transformOrigin: 'center top' })),
        ]),
      ])
    ],),
    transition('* <=> *', [

      query('#whiteLayer', [
        style({ minWidth: '100%', minHeight: '100%', opacity: 1 }),
        animate('600ms 1ms ease-in-out', style({ opacity: 0 })),
      ]),
    ],)
  ])]
})
export class AppComponent extends UnsubOnDestroy {

  constructor(public translate: TranslateService, private websocket: SocketService,
    private dateAdapter: DateAdapter<moment.Moment>, private loginService: LoginService) {
    super()
  }

  async ngOnInit() {
    this.sub.add(this.loginService.pr.user.subscribe(v => this.websocket.connect(v)));//just to initialize it.
    // Register translation languages
    this.translate.addLangs(['en', 'ar']);
    this.translate.setDefaultLang('en');
    this.translate.use(localStorage.getItem('lang') === 'ar' ? 'ar' : 'en');//in the constructor to speed up language used
    this.sub.add(this.translate.onLangChange.subscribe(() => this.handleOnLangChange()));

    this.handleOnLangChange();
    var isRememberMe: 'true' | 'false' = localStorage.getItem('isRememberMe') as 'true' | 'false';
    if (this.loginService.pr.user.value == null && isRememberMe != 'false')
      this.loginService.pr.user.next(await this.loginService.isLogin());
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
