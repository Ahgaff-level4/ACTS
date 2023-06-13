import { Component, OnInit } from '@angular/core';
import { UtilityService } from 'src/app/services/utility.service';
import { Role } from '../../../../../../interfaces';
import { AsyncSubject, Observable, ReplaySubject, Subject, map, of, share, shareReplay, tap } from 'rxjs';
import { AsyncScheduler } from 'rxjs/internal/scheduler/AsyncScheduler';
import { AsyncAction } from 'rxjs/internal/scheduler/AsyncAction';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  constructor(public ut: UtilityService) { }

  public cards!: Card[];

  ngOnInit(): void {

    const subject = new Subject();
    const obs = new Observable((subscriber) => {
      console.warn('obs execution started')
      subject.subscribe(subscriber);
      setTimeout(() => subject.next('children1'), 500)
    }).pipe(shareReplay(1));

    obs.subscribe((v) => console.warn('sub1', v))
    obs.subscribe((v) => console.warn('sub2', v))
    setTimeout(() => {obs.subscribe((v) => console.warn('sub3', v));console.warn('sub3 subscribed')}, 550);

    setTimeout(() => {
      console.warn('timeout emit to subject')
      subject.next('children2');
      obs.subscribe(v=>console.warn('sub4',v));
      subject.next('children3')
    }, 2000)






    const _cards: Card[] = [
      {
        title: 'Children',
        link: '/children',
        img: 'assets/img/girl.svg', alt: 'girl photo',
        desc: 'Children information',
        role: ['Admin', 'HeadOfDepartment', 'Teacher', 'Parent',]
      },
      {
        title: "Special Activities",
        img: "assets/img/Activity.svg",
        link: "/special-activities",
        desc: "Special Activities information",
        role: ['Admin', 'HeadOfDepartment']
      },
      {
        title: "Programs",
        img: "assets/img/Program.svg",
        link: "/program",
        desc: "Programs information",
        role: ['Admin', 'HeadOfDepartment', 'Teacher']
      },
      {
        title: 'Accounts',
        link: '/account',
        img: 'assets/img/Account.svg',
        desc: 'Manage all users accounts',
        role: ['Admin']
      },
      {
        title: 'Settings',
        link: '/settings',
        img: 'assets/img/Setting.svg',
        desc: 'Settings and preference',
      },
    ];

    this.cards = _cards.filter(v => v.role ? this.ut.userHasAny(...v.role) : true);
  }
}

interface Card {
  title: string, link: string, img: string, alt?: string, desc: string, role?: Role[]
}
