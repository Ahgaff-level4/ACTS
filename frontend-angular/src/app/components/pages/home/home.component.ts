import { Component } from '@angular/core';
import { UtilityService } from 'src/app/services/utility.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  constructor(public ut: UtilityService) { }

  public cards:{title:string, link:string,img:string,alt?:string,desc:string}[] = [
    {title:'Children', link:'/children',img:'assets/img/girl.svg',alt:'girl photo',desc:'Children information'},
    {title:'Settings', link:'/settings',img:'assets/app-UI/Home page – 1.svg',desc:'Children information'},
    {title:'Accounts', link:'/accounts',img:'assets/img/favicon.ico',desc:'Accounts information page access their information and add/edit or event delete be caution your actions have results'},
    {
      "title": "Lorem ipsum dolor sit amet",
      "img": "assets/img/girl.svg",
      "link":"adsf",
      "desc": "Consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
    },
    {
      "title": "Ut enim ad minim veniam",
      "img": "assets/img/girl.svg",
      "link":"adsf",
      "desc": "Quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
    },
    {
      "title": "Duis aute irure dolor in reprehenderit",
      "img": "assets/img/girl.svg",
      "link":"adsf",
      "desc": "In voluptate velit esse cillum dolore eu fugiat nulla pariatur."
    },
    {
      "title": "Excepteur sint occaecat cupidatat non proident",
      "img": "assets/img/girl.svg",
      "link":"adsf",
      "desc": "Sunt in culpa qui officia deserunt mollit anim id est laborum."
    }
  ]
}
