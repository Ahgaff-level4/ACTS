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
    {title:'Settings', link:'/settings',img:'assets/img/Setting.svg',desc:'Children information'},
    {title:'Accounts', link:'/accounts',img:'assets/img/Account.svg',desc:'Accounts information page access their information and add/edit or event delete be caution your actions have results'},


    {
      "title": "Activities",
      "img": "assets/img/Activity.svg",
      "link":"adsf",
      "desc": "In voluptate velit esse cillum dolore eu fugiat nulla pariatur."
    },
    {
      "title": "Programs",
      "img": "assets/img/Program.svg",
      "link":"adsf",
      "desc": "Sunt in culpa qui officia deserunt mollit anim id est laborum."
    }
  ]
}
