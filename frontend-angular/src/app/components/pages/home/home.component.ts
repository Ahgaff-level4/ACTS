import { Component, OnInit } from '@angular/core';
import { UtilityService } from 'src/app/services/utility.service';
import { Role } from '../../../../../../interfaces';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  constructor(public ut: UtilityService) { }

  public cards!: Card[];

  ngOnInit(): void {
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
