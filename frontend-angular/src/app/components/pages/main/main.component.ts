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

}
