import { Location as NgLocation } from '@angular/common';
import { Component, EventEmitter, Input, OnInit } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ACTS_Segment } from 'src/app/app-routing.module';
import { ChildService } from 'src/app/services/CRUD/child.service';
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

/**
 *     goals             view-child           Children
 * ---------------    ---------------     ---------------
 * |  ../../.. ->|    |     ../.. ->|     |          .. |
 * |             |    |             |     |             |
 * |             |    |             |     |             |
 * ---------------    ---------------     ---------------
 * Each nested page has url that refer to the previous page.
 * Ex: children/child/2/goals
 * 'goals' segment is for goals page. Last segment determine the current page.
 * previous segment 'child/2' is for child-view page.
 * previous previous 'children' is children page.
 * segments are not random and can not be any shape and are ordered correctly.
 */



export class TitleComponent implements OnInit {
  @Input() links: TitleLink[] = [];//todo delete line
  @Input() link!: TitleLink;
  /**Hide back button when printing */
  @Input('isPrinting') isPrinting: boolean | undefined;
  @Input() back?: EventEmitter<void>;

  /**back button will navigate to links[1] */
  // protected back: Link | undefined;
  constructor(public ut: UtilityService, private location: NgLocation,
    private childService: ChildService) { }

  ngOnInit(): void {
    this.calcLinks(this.location.path());

    this.back?.subscribe(() => {
      if (this.links[1].link)
        this.ut.router.navigateByUrl(this.links[1].link)
    });

    if (this.links.length == 0)
      throw "TitleComponent expects `links` array with at least one element! Got links=" + this.links;
    if (this.links[1] && typeof this.links[1].link != 'string')
      throw 'TitleComponent expect previous(links[1]) to have property link as `links[1].link` but links[1]=' + this.links[1].link + '. This is error because if links[1] exist then show back arrow icon but it has no link!'
    this.links = this.links.filter(v => v.hide != true);
  }

  async calcLinks(path: string) {
    console.log('is input link reach when navigationEnd', this.link);
    // this.service.links.push(this.link);
    this.links = [];
    const segments = path.split('/') as ACTS_Segment[];
    for (let i = 0; i < segments.length; i++) {
      let s = segments[i];
      if (s == 'children')
        this.links.push({ title: 'Children', link: '/children' })
      else if (s == 'child') {
        let id = +segments[i + 1];
        if (Number.isInteger(id)) {
          const children = await firstValueFrom(this.childService.children$)
          this.links.push({ title: 'Child information', titleLink: children.find(v => v.id == id)?.person?.name })
        }//todo if else for other pages
      }
    }
    this.links.reverse();
  }

  /**Add "Page" prefix to the link's title. (e.g. 'Page title_name') */
  tooltipOf(link: TitleLink) {
    if (link == this.links[0])
      return this.ut.translate('Current page');
    return this.ut.getDirection() == 'rtl' ?
      (this.ut.translate('page') + ' ' + this.ut.translate(link.title) + (link.titleSuffix ? ' ' + link.titleSuffix : ''))
      : ((link.title) + (link.titleSuffix ? ' ' + link.titleSuffix : '') + ' ' + this.ut.translate('page'));
  }

  getLinkText(link: TitleLink): string {
    return link.titleLink ?? link.title
  }

  getLinkTextSuffix(link: TitleLink): string {
    if (link.titleLinkSuffix)
      return link.titleLinkSuffix;
    if (link.titleLink)
      return '';//titleLink provided but titleLinkSuffix not then there is no suffix.
    return link.titleSuffix ?? '';//Otherwise the title is provided and the suffix should be the title suffix
  }
}

export interface TitleLink {
  title: string,
  /**`${title}${titleSuffix ? ': ' + titleSuffix : ''} `*/
  titleSuffix?: string,
  link?: string
  /**The link text. Default is title value. Note: title will be used as tooltip for the `titleLink` */
  titleLink?: string
  titleLinkSuffix?: string;
  fragment?: string;
  /**Default is `false` */
  hide?: boolean;
}
/**
 * Provided:...
 * Title looks like:...
 *
 * vvvvvvvvvvvvvvvvvvvvvvv
 *
 * TitleLink={title}
 * <- {title}
 *
 * titleLink={title, titleSuffix}
 * <- {title}: {titleSuffix}
 *
 * titleLink[] = [{title},...]
 * <- {titleLink[0].title}
 *    titleLink.map([title](link))
 *
 * titleLink[] = [{title, titleSuffix},...]
 * <- {titleLink[0].title}: {titleLink[0].titleSuffix}
 *    titleLink.map([title+': '+titleSuffix](link))
 *
 * titleLink[] = [{title, link, titleLink},...]
 * <- {titleLink[0].title}
 *    titleLink.map([titleLink](link))
 *
 * titleLink[] = [{title, titleSuffix, link, titleLink, }]
 * <- {titleLink[0].title}: {titleLink[0].titleSuffix}
 *    titleLink.map([titleLink](link))
 *
 * titleLink[] = [{title, titleSuffix, link, titleLink, titleLinkSuffix}]
 * <- {titleLink[0].title}: {titleLink[0].titleSuffix}
 *    titleLink.map([titleLink+': '+titleLinkSuffix](link))
 *
 */