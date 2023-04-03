import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MatPaginatorIntl } from '@angular/material/paginator';
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

  constructor(public translate: TranslateService, private ut: UtilityService) {
    super();
    this.subscribeOnLangChange();
    this.translate.use(sessionStorage.getItem('lang') === 'ar' ? 'ar' : 'en');//duplicate line used to speed up language used
    this.handleOnLangChange();
  }
  private sub!: Subscription;
  ngOnInit = async () => {
    // Register translation languages
    this.translate.addLangs(['en', 'ar']);
    this.translate.setDefaultLang('en');
    this.translate.use(sessionStorage.getItem('lang') === 'ar' ? 'ar' : 'en');
    this.subscribeOnLangChange();
    this.handleOnLangChange();
  }
  subscribeOnLangChange() {
    if (this.sub)
      this.sub.unsubscribe();
    this.sub = this.translate.onLangChange.subscribe(() => this.handleOnLangChange());
  }

  async handleOnLangChange() {
    document.documentElement.lang = this.translate.currentLang;
    document.documentElement.dir = this.translate.currentLang === 'ar' ? 'rtl' : 'ltr';
    moment.locale(this.translate.currentLang==='ar'?'ar-kw':'en')
    sessionStorage.setItem('lang', this.translate.currentLang);
    let words = ['Items per page:', 'Next page', 'Previous page', 'First page', 'Last page', 'of'];
    let objWords = await this.ut.translate(words) as { [key: string]: string };//returns {'Next page':'Next page'...etc} or in arabic will be {'Next page':'الصفحة التالية'...etc}
    this.itemsPerPageLabel = objWords[words[0]];
    this.nextPageLabel = objWords[words[1]];
    this.previousPageLabel = objWords[words[2]];
    this.firstPageLabel = objWords[words[3]];
    this.lastPageLabel = objWords[words[4]];
    let of = objWords[words[5]];
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
