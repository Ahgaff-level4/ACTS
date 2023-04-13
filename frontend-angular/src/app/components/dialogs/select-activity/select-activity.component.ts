import { Component } from '@angular/core';
import { ProgramService } from 'src/app/services/program.service';
import { UtilityService } from 'src/app/services/utility.service';
import { IActivityEntity, IProgramEntity } from '../../../../../../interfaces';
import { MatDialogRef } from '@angular/material/dialog';
import { MatButtonToggleChange } from '@angular/material/button-toggle';

@Component({
  selector: 'app-select-activity',
  templateUrl: './select-activity.component.html',
  styleUrls: ['./select-activity.component.scss']
})
export class SelectActivityComponent {
  public chosenProgram: IProgramEntity | undefined;
  public filterActivity: string = 'age';
  public activities: IActivityEntity[] | [] = [];
  constructor(public dialogRef: MatDialogRef<any>, public programService: ProgramService, private ut: UtilityService) {
    if (programService.programs.value.length === 0) {
      this.ut.isLoading.next(true);
      this.programService.fetch().finally(() => this.ut.isLoading.next(false))
        .then((v) => console.log(this.programService.programs.value))
    }
  }

  onSelectionChangeProgram(value: IProgramEntity | undefined) {
    if (value != null) {
      this.ut.isLoading.next(true);
      this.programService.fetchOne(value.id)//fetchOne will return the program with its activities
        .then((v) => {
          this.chosenProgram = v;
          this.filterActivities();
        })
        .finally(() => this.ut.isLoading.next(false))
    }
  }

  onSelectionChangeActivity(chosenActivity: IActivityEntity | undefined) {
    if (chosenActivity != null)
      this.dialogRef.close(chosenActivity);
  }

  filterActivities(filter?: 'age' | 'all') {
    if (filter !== 'all') {
      if (this.chosenProgram?.activities)
        this.activities = this.chosenProgram.activities
          .filter((v, i, arr) => {
            
          });
    }else {
      if(this.chosenProgram?.activities)
      this.activities = this.chosenProgram.activities;
    }
  }
}
