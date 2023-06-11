import { Component, Input } from '@angular/core';
import { UtilityService } from 'src/app/services/utility.service';

@Component({
  selector: 'app-title[title1][isPrinting]',
  templateUrl: './title.component.html',
  styleUrls: ['./title.component.scss']
})/**
Shared component to set the title for any page (No need for translation). Ex: `title1=Goals`, `title2=Goals of`: `param2=Ahmad`...
Note: `title1` and `isPrinting` are required*/
export class TitleComponent {
  @Input('title1') title1: string = '';
  @Input('title2') title2: string | undefined;
  @Input('param2') param2: string | undefined;
  @Input('title3') title3: string | undefined;
  @Input('param3') param3: string | undefined;
  @Input('backLink') backLink: string | undefined;
  @Input('backTooltip') backTooltip: string | undefined;
  /**Hide back button when printing */
  @Input('isPrinting') isPrinting: boolean | undefined;

  constructor(public ut: UtilityService) { }
}
