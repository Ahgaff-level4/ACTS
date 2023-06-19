import { Component, OnInit } from '@angular/core';
import { UtilityService } from 'src/app/services/utility.service';
import { Role } from '../../../../../../interfaces';
import { AsyncSubject, Observable, ReplaySubject, Subject, map, of, share, shareReplay, tap } from 'rxjs';
import { AsyncScheduler } from 'rxjs/internal/scheduler/AsyncScheduler';
import { AsyncAction } from 'rxjs/internal/scheduler/AsyncAction';
import { Action, PrivilegeService } from 'src/app/services/privilege.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  constructor(public pr: PrivilegeService) { }

  public cards!: Card[];

  ngOnInit(): void {
    const _cards: Card[] = [
      {
        title: 'Children',
        link: '/children',
        img: 'assets/img/girl.svg', alt: 'girl photo',
        desc: 'Children information',
        role: 'childrenPage'
      },
      {
        title: "Special Activities",
        img: "assets/img/Activity.svg",
        link: "/special-activities",
        desc: "Special Activities information",
        role: 'specialActivitiesPage'
      },
      {
        title: "Programs",
        img: "assets/img/Program.svg",
        link: "/program",
        desc: "Programs information",
        role: 'programsPage'
      },
      {
        title: 'Accounts',
        link: '/account',
        img: 'assets/img/Account.svg',
        desc: 'Manage all users accounts',
        role: 'accountsPage'
      },
      {
        title: 'Settings',
        link: '/settings',
        img: 'assets/img/Setting.svg',
        desc: 'Settings and preference',
      },
      //todo field page
    ];

    this.cards = _cards.filter(v => v.role ? this.pr.canUser(v.role) : true);
  }
}

interface Card {
  title: string,
  link: string,
  img: string,
  alt?: string,
  desc: string,
  role?: Action

}
