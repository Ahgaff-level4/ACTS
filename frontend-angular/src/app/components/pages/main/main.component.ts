import { Component } from '@angular/core';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent {
  public title:string= "Hello"
  
  changeTitle() {
    if (this.title == 'Hello')
      this.title = 'Hi'
    else this.title = "Hello";
  }
}
