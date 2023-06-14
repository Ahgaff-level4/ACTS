import { Component, Input, OnInit } from '@angular/core';
import { UtilityService } from 'src/app/services/utility.service';

@Component({
  selector: 'app-title[header][isPrinting]',
  templateUrl: './title.component.html',
  styleUrls: ['./title.component.scss']
})/**
Shared component to set the title for any page (No need for translation). Ex: `title1=Goals`, `title2=Goals of`: `param2=Ahmad`...
Note: `title1` and `isPrinting` are required*/
export class TitleComponent implements OnInit {
  @Input('header') title: string = '';/**title is preserve word for browser tooltip */
  @Input() links: Link[] = [];
  /**Hide back button when printing */
  @Input('isPrinting') isPrinting: boolean | undefined;

  protected back: Link | undefined;
  constructor(public ut: UtilityService) { }
  ngOnInit(): void {
    this.back = this.links[this.links.length - 2];
  }

  /**Add "Page" prefix to the link's title. (e.g. 'Page title_name') */
  tooltipOf(link: Link) {
    return this.ut.getDirection() == 'rtl' ?
      this.ut.translate('page') + ' ' + this.ut.translate(link.title) + (link.param ? ' ' + link.param : '')
      : (link.title) + (link.param ? ' ' + link.param : '') + ' ' + this.ut.translate('page');
  }
}

interface Link {
  title: string,
  param?: string,
  link?: string
}