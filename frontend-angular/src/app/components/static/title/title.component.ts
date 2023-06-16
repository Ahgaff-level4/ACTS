import { Component, Input, OnInit } from '@angular/core';
import { UtilityService } from 'src/app/services/utility.service';

@Component({
  selector: 'app-title[links][isPrinting]',
  templateUrl: './title.component.html',
  styleUrls: ['./title.component.scss']
})/**
Shared component to set the title for any page (No need for translation). Ex: `[{title='Goals'}]`, `[{title='Goals of', param='Ahmad'}]`...
- `links` and `isPrinting` are required.
- links array is ordered as 0 index is the current page followed by previous page, previous previous...
- links array at least should has one element (current page).*/
export class TitleComponent implements OnInit {
  @Input() links: Link[] = [];
  /**Hide back button when printing */
  @Input('isPrinting') isPrinting: boolean | undefined;

  /**back button will navigate to links[1] */
  // protected back: Link | undefined;
  constructor(public ut: UtilityService) { }
  ngOnInit(): void {
    if (this.links.length == 0)
      throw "TitleComponent expects `links` array with at least one element! Got links=" + this.links;
    if (this.links[1] && typeof this.links[1].link != 'string')
      throw 'TitleComponent expect previous(links[1]) to have property link as `links[1].link` but links[1]=' + this.links[1].link + '. This is error because if links[1] exist then show back arrow icon but it has no link!'
  }

  /**Add "Page" prefix to the link's title. (e.g. 'Page title_name') */
  tooltipOf(link: Link) {
    if (link == this.links[0])
      return this.ut.translate('Current page');
    return this.ut.getDirection() == 'rtl' ?
      (this.ut.translate('page') + ' ' + this.ut.translate(link.title) + (link.param ? ' ' + link.param : ''))
      : ((link.title) + (link.param ? ' ' + link.param : '') + ' ' + this.ut.translate('page'));
  }
}

interface Link {
  title: string,
  param?: string,
  link?: string
}