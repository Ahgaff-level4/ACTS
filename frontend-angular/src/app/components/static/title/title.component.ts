import { Location as NgLocation } from '@angular/common';
import { Component, EventEmitter, Input, OnInit } from '@angular/core';
import { NavigationEnd } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ACTS_Segment } from 'src/app/app-routing.module';
import { AccountService } from 'src/app/services/CRUD/account.service';
import { ChildService } from 'src/app/services/CRUD/child.service';
import { EvaluationService } from 'src/app/services/CRUD/evaluation.service';
import { FieldService } from 'src/app/services/CRUD/field.service';
import { GoalService } from 'src/app/services/CRUD/goal.service';
import { ProgramService } from 'src/app/services/CRUD/program.service';
import { TitlePathService } from 'src/app/services/title-path.service';
import { UtilityService } from 'src/app/services/utility.service';
import { UnsubOnDestroy } from 'src/app/unsub-on-destroy';

@Component({
  selector: 'app-title[isPrinting]',
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



export class TitleComponent extends UnsubOnDestroy implements OnInit {
  public links: TitleLink[] = [];
  @Input() link?: TitleLink;//todo delete this line
  /**Hide back button when printing */
  @Input('isPrinting') isPrinting: boolean | undefined;
  @Input() back?: EventEmitter<void>;

  /**back button will navigate to links[1] */
  // protected back: Link | undefined;
  constructor(public ut: UtilityService, private location: NgLocation,
    private childService: ChildService, private programService: ProgramService,
    private fieldService: FieldService, private evaluationService: EvaluationService,
    private accountService: AccountService,
  ) { super() }

  ngOnInit(): void {
    const path = this.location.path();
    if (this.link) this.link.link = path;
    this.calcLinks(path);

    this.back?.subscribe(() => {
      if (this.links[1]?.link)
        this.ut.router.navigateByUrl(this.links[1].link)
    });

    if (this.links.length == 0)
      throw "TitleComponent expects `links` array with at least one element! Got links=" + this.links;
    if (this.links[1] && typeof this.links[1].link != 'string')
      throw 'TitleComponent expect previous(links[1]) to have property link as `links[1].link` but links[1]=' + this.links[1].link + '. This is error because if links[1] exist then show back arrow icon but it has no link!'
    this.links = this.links.filter(v => v.hide != true);
  }

  async calcLinks(path: string) {
    const segments = path.split('/') as ACTS_Segment[];

    for (let i = 0; i < segments.length; i++) {
      let s = segments[i];
      if (s == 'children')
        this.links.push({ title: 'Children', link: '/children' });
      else if (s == 'settings')
        this.links.push({ title: 'Settings', link: '/settings' });
      else if (s == 'special-activities')
        this.links.push({ title: 'Special Activities', link: '/special-activities' });
      else if (s == 'programs')
        this.links.push({ title: 'Programs', link: '/programs' });
      else if (s == 'fields')
        this.links.push({ title: 'Fields', link: '/fields' });
      else if (s == 'accounts')
        this.links.push({ title: 'Accounts', link: '/accounts' });
      else if (s == 'add-child' || s == 'edit-child')
        this.links.push({ title: (s == 'edit-child' ? 'Edit child information' : 'Register a child'), titleLink: (s == 'edit-child' ? 'Edit' : 'Add') });
      else if (s == 'add-account' || s == 'edit-account')
        this.links.push({ title: (s == 'edit-account' ? 'Edit account' : 'Register new account'), titleLink: s == 'edit-account' ? 'Edit' : 'Add' });
      else if (s == 'child') {
        let id = +segments[i + 1];
        if (Number.isInteger(id)) {
          const child = (await firstValueFrom(this.childService.children$)).find(v => v.id == id);
          let prevLink = this.links[this.links.length - 1];
          this.links.push({ title: 'Child information', titleLink: child?.person?.name, link: (prevLink?.link ? (prevLink.fragment ? (prevLink.link + '/' + prevLink.fragment) : prevLink.link) : '') + '/child/' + id });
        }
      }
      else if (s == 'report' && this.links[this.links.length - 1].title == 'Child information') {
        let prevLink = this.links[this.links.length - 1];
        this.links.push({ title: 'Child Report', titleSuffix: prevLink.titleLink, titleLink: 'Report' })
      }
      else if (s == 'goals') {
        let prevLink = this.links[this.links.length - 1];//goals is exist after child so last element will be child information link
        this.links.push({ title: 'Goals of', titleSuffix: prevLink.titleLink, titleLink: 'Goals', link: prevLink.link + '/goals' })
      }
      else if (s == 'strengths') {
        let prevLink = this.links[this.links.length - 1];//strengths is exist after child so last element will be child information link
        this.links.push({ title: 'Strengths of', titleSuffix: prevLink.titleLink, titleLink: 'Strengths', link: prevLink.link + '/strengths' })
      }
      else if (s == 'program') {//there is no program/field page these are for activities so we will jump activities segment
        let id = +segments[i + 1];
        if (Number.isInteger(id)) {
          let program = (await firstValueFrom(this.programService.programs$)).find(v => v.id == id);
          this.links.push({ title: 'Activities of program', titleSuffix: program?.name ?? '', link: '/programs/program/' + id + '/activities' })
        }
      }
      else if (s == 'field') {
        let id = +segments[i + 1];
        if (Number.isInteger(id)) {
          let field = (await firstValueFrom(this.fieldService.fields$)).find(v => v.id == id);
          this.links.push({ title: 'Activities of field', titleSuffix: field?.name ?? '', link: '/fields/field/' + id + '/activities' })
        }
      }
      else if (s == 'goal') {//there is no goal page, goal url is for evaluations so we will jump evaluations segment
        let id = +segments[i + 1];
        if (Number.isInteger(id)) {
          this.links.push({ title: 'Evaluations of goal', })
          this.sub.add(this.evaluationService.goalItsEvaluations$.subscribe(goal => {
            if (goal) {
              let l = this.links.find(v => v.title == 'Evaluations of goal')
              if (l) l.titleSuffix = goal.activity.name;
            }
          }));
        }
      }
      else if (s == 'account') {
        let id = +segments[i + 1];
        if (Number.isInteger(id)) {
          let prevLink = this.links[this.links.length - 1];
          let accountLink = (prevLink?.link ? (prevLink.fragment ? (prevLink.link + '/' + prevLink.fragment) : prevLink.link) : '') + '/account/' + id;
          this.links.push({ title: 'Account information', link: accountLink })
          this.sub.add(this.accountService.accounts$.subscribe(accounts => {
            if (accounts) {
              let account = accounts.find(v => v.id == id);
              let l = this.links.find(v => v.link == accountLink);
              if (l && account) l.titleLink = account.person.name;
            } else this.accountService.fetch();
          }));
        }
      }
      else if (s == 'teachers') {//child teachers
        let prevLink = this.links[this.links.length - 1];
        this.links.push({ title: 'Child Teachers', link: prevLink?.link, fragment: 'teachers', tooltip: 'Child Teachers', tooltipSuffix: prevLink.titleLink });//same previous link page but different fragment
      }
      else if (s == 'teaches') {//teacher teaches
        let prevLink = this.links[this.links.length - 1];
        this.links.push({ title: 'Teaches Children', link: prevLink?.link, fragment: 'teaches', tooltip: 'Teaches Children', tooltipSuffix: prevLink.titleLink });//same previous link page but different fragment
      }
      else if (s == 'kids') {//parent kids
        let prevLink = this.links[this.links.length - 1];
        this.links.push({ title: 'Parent Children', link: prevLink?.link, fragment: 'kids', tooltip: 'Parent Children', tooltipSuffix: prevLink.titleLink });//same previous link page but different fragment
      }
      else if (s == 'parent') {//child parent
        let prevLink = this.links[this.links.length - 1];
        this.links.push({ title: 'Parent', link: prevLink.link, fragment: 'parent', tooltip: 'Parent of', tooltipSuffix: prevLink.titleLink })
      }
    }

    if (this.links.length == 0 && this.link)
      this.links = [this.link];
  }

  /**Add "Page" prefix to the link's title. (e.g. 'Page title_name') */
  tooltipOf(link: TitleLink | undefined) {
    if (link == this.links[this.links.length - 1])
      return this.ut.translate('Current page');
    if (link?.tooltip)
      return this.ut.translate(link.tooltip) + (link.tooltipSuffix ? ' ' + link.tooltipSuffix : '');
    else return this.ut.currentLang == 'ar' ? (this.ut.translate('page') + ' ' + this.ut.translate(link?.title) + (link?.titleSuffix ? ' ' + link?.titleSuffix : ''))
      : ((link?.title) + (link?.titleSuffix ? ' ' + link?.titleSuffix : '') + ' ' + this.ut.translate('page'));

  }

  getLinkText(link: TitleLink | undefined): string {
    return link?.titleLink ?? link?.title ?? ''
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
  class?: string;
  /**Default is `true` */
  tooltip?: string;
  tooltipSuffix?: string;
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