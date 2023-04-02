import { Component, Input, OnInit } from '@angular/core';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { TranslateService } from '@ngx-translate/core';
import { UtilityService } from 'src/app/services/utility.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent extends MatPaginatorIntl implements OnInit {

  constructor(public translate: TranslateService, private ut: UtilityService) {
    super();
    this.overridePaginatorWords();
    this.translate.onLangChange.subscribe(() => this.overridePaginatorWords());

  }
  async ngOnInit() {
    // Register translation languages
    this.translate.addLangs(['en', 'ar']);
    this.translate.setDefaultLang('en');
    this.translate.use('en');
    this.translate.onLangChange.subscribe(async () => await this.overridePaginatorWords());
    await this.overridePaginatorWords();
    this.dir = this.translate.currentLang === 'en' ? 'ltr' : 'rtl';
  }
  public dir!: 'ltr' | 'rtl';
  override itemsPerPageLabel: string='hi';
  async overridePaginatorWords() {
    this.itemsPerPageLabel = await this.ut.translate('Items per page:');
    this.nextPageLabel = await this.ut.translate('Next page');
    this.previousPageLabel = await this.ut.translate('Previous page');
    this.firstPageLabel = await this.ut.translate('First page');
    this.lastPageLabel = await this.ut.translate('Last page');
    let of = await this.ut.translate('of');
    this.getRangeLabel = (page: number, pageSize: number, length: number) => {
      if (length == 0 || pageSize == 0)
        return `0 ${of} ${length}`;
      length = Math.max(length, 0);
      const startIndex = page * pageSize, endIndex = startIndex < length ? Math.min(startIndex + pageSize, length) : startIndex + pageSize;    // If the start index exceeds the list length, do not try and fix the end index to the end.
      return `${startIndex + 1} – ${endIndex} ${of} ${length}`;
    }
    this.changes.next();
    this.dir = this.translate.currentLang === 'en' ? 'ltr' : 'rtl';
  }
}
