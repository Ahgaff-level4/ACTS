import { Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent {
  public title:string= "Hello";
  public myFormGroup = new FormGroup({
    name:new FormControl('None'),
    age:new FormControl('0')
  });
  
  changeTitle() {
    if (this.title == 'Hello')
      this.title = 'Hi'
    else this.title = "Hello";
  }
}
