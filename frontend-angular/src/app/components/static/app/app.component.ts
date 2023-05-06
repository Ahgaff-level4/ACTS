import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { Subscription } from 'rxjs';
import { UtilityService } from 'src/app/services/utility.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent extends MatPaginatorIntl implements OnInit, OnDestroy {

  private sub: Subscription = new Subscription();
  public isLoading: boolean = true;
  constructor(public translate: TranslateService, private ut: UtilityService, private dateAdapter: DateAdapter<moment.Moment>, private router: Router) {
    super();

  }

  ngOnInit() {
    // Register translation languages
    this.translate.addLangs(['en', 'ar']);
    this.translate.setDefaultLang('en');
    this.translate.use(localStorage.getItem('lang') === 'ar' ? 'ar' : 'en');//in the constructor to speed up language used
    // this.subscribeOnLangChange();
    this.sub.add(this.translate.onLangChange.subscribe(() => this.handleOnLangChange()));
    this.router.events.subscribe({
      next: (event) => {
        if (event instanceof NavigationStart)
          this.ut.isLoading.next(true)
        else if (event instanceof NavigationEnd || event instanceof NavigationCancel || event instanceof NavigationError)
          this.ut.isLoading.next(false);
      }, error: () => this.ut.isLoading.next(false)
    });
    // this.subscribeOnLangChange();
    this.ut.isLoading.subscribe(v => this.isLoading = v);
    this.handleOnLangChange();
    this.ut.isLogin().finally(() => console.log('isLogin:', this.ut.user.value));
  }

  // subscribeOnLangChange = () => {
  // if (this.sub)
  //   this.sub.unsubscribe();
  // }

  handleOnLangChange = async () => {
    const currentLang = this.translate.currentLang;
    moment.locale(currentLang === 'ar' ? 'ar-ly' : 'en-gb');
    this.dateAdapter.setLocale(currentLang === 'ar' ? 'ar-ly' : 'en-gb');
    document.documentElement.lang = currentLang;
    document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
    localStorage.setItem('lang', currentLang);
    this.itemsPerPageLabel = this.ut.translate('Items per page:');
    this.nextPageLabel = this.ut.translate('Next page');
    this.previousPageLabel = this.ut.translate('Previous page');
    this.firstPageLabel = this.ut.translate('First page');
    this.lastPageLabel = this.ut.translate('Last page');
    let of = this.ut.translate('of');
    this.getRangeLabel = (page: number, pageSize: number, length: number) => {
      if (length == 0 || pageSize == 0)
        return `0 ${of} ${length}`;
      length = Math.max(length, 0);
      const startIndex = page * pageSize, endIndex = startIndex < length ? Math.min(startIndex + pageSize, length) : startIndex + pageSize;    // If the start index exceeds the list length, do not try and fix the end index to the end.
      return `${startIndex + 1} – ${endIndex} ${of} ${length}`;
    }
    this.changes.next();
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

}
