import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent {
  public title:string= "Hello";
  public myFormGroup = new FormGroup({
    name:new FormControl('None',[Validators.required,Validators.maxLength(10)]),
    age:new FormControl('0',Validators.max(100))
  });
  
  changeTitle() {
    if (this.title == 'Hello')
      this.title = 'Hi'
    else this.title = "Hello";
  }
}
