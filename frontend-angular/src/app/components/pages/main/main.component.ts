import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { GoalService } from 'src/app/services/goal.service';
import { ProgramService } from 'src/app/services/program.service';
import { UtilityService } from 'src/app/services/utility.service';
import { IProgramEntity } from '../../../../../../interfaces';
import { SelectActivityComponent } from '../../dialogs/select-activity/select-activity.component';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent {
  public title: string = "Hello";
  public myFormGroup = new FormGroup({
    name: new FormControl('None', [Validators.required, Validators.maxLength(10)]),
    age: new FormControl('0', Validators.max(100))
  });
constructor(private dialog:MatDialog){
  this.dialog.open(SelectActivityComponent);
}
  changeTitle() {
    if (this.title == 'Hello')
      this.title = 'Hi'
    else this.title = "Hello";
  }
}
