import { Component, Input } from '@angular/core';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { TranslateService } from '@ngx-translate/core';
import { UtilityService } from 'src/app/services/utility.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent extends MatPaginatorIntl {

  constructor(public translate: TranslateService, private ut: UtilityService) {
    super();
    // Register translation languages
    translate.addLangs(['en', 'ar']);

    // Set default language
    translate.setDefaultLang('en');
    translate.onLangChange.subscribe(() => this.overridePaginatorWords());
    this.overridePaginatorWords();
  }

  async overridePaginatorWords() {
    this.itemsPerPageLabel = await this.ut.translate('Items per page: ');
    this.nextPageLabel = await this.ut.translate('Next page');
    this.previousPageLabel = await this.ut.translate('Previous page');
    this.firstPageLabel = await this.ut.translate('First page');
    this.lastPageLabel = await this.ut.translate('Last page');
    this.getRangeLabel = (page: number, pageSize: number, length: number) => {
      if (length == 0 || pageSize == 0)
        return `0 … ${length}`;
      length = Math.max(length, 0);
      const startIndex = page * pageSize, endIndex = startIndex < length ? Math.min(startIndex + pageSize, length) : startIndex + pageSize;    // If the start index exceeds the list length, do not try and fix the end index to the end.
      return `${startIndex + 1} – ${endIndex} … ${length}`;
    }
  }
}
