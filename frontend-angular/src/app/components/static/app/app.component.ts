import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { Subscription } from 'rxjs';
import { UtilityService } from 'src/app/services/utility.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS] },
  ]
})
export class AppComponent extends MatPaginatorIntl implements OnInit, OnDestroy {

  constructor(public translate: TranslateService, private ut: UtilityService, private dateAdapter: DateAdapter<moment.Moment>) {
    super();
    this.translate.addLangs(['en', 'ar']);
    this.translate.use(sessionStorage.getItem('lang') === 'ar' ? 'ar' : 'en');//in the constructor to speed up language used
    this.subscribeOnLangChange();
  }

  private sub!: Subscription;
  ngOnInit = async () => {
    // Register translation languages
    this.translate.setDefaultLang('en');
    this.handleOnLangChange();
  }

  subscribeOnLangChange = () => {
    if (this.sub)
      this.sub.unsubscribe();
    this.sub = this.translate.onLangChange.subscribe(() => this.handleOnLangChange());
  }

  handleOnLangChange = async () => {
    console.log('language changed')
    moment.locale(this.translate.currentLang === 'ar' ? 'ar-kw' : 'en-gb');
    this.dateAdapter.setLocale(this.translate.currentLang === 'ar' ? 'ar-ly' : 'en-gb');
    document.documentElement.lang = this.translate.currentLang;
    document.documentElement.dir = this.translate.currentLang === 'ar' ? 'rtl' : 'ltr';
    sessionStorage.setItem('lang', this.translate.currentLang);
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
