import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-title',
  templateUrl: './title.component.html',
  styleUrls: ['./title.component.scss']
})/**
Shared component to set the title for any page (No need for translation). Ex: `title1=Goals`, `title2=Goals of`: `param2=Ahmad`... */
export class TitleComponent {
  @Input('title1') title1: string | undefined;
  @Input('title2') title2: string | undefined;
  @Input('param2') param2: string | undefined;
  @Input('title3') title3: string | undefined;
  @Input('param3') param3: string | undefined;
}
