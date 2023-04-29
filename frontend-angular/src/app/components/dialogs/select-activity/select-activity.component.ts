import { Component, OnInit } from '@angular/core';
import { ProgramService } from 'src/app/services/program.service';
import { UtilityService } from 'src/app/services/utility.service';
import { IActivityEntity, IProgramEntity } from '../../../../../../interfaces';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { GoalService } from 'src/app/services/goal.service';
import { AddEditActivityComponent } from '../add-edit-activity/add-edit-activity.component';

@Component({
  selector: 'app-select-activity',
  templateUrl: './select-activity.component.html',
  styleUrls: ['./select-activity.component.scss']
})
export class SelectActivityComponent implements OnInit {
  public chosenProgram: IProgramEntity | undefined;
  public filter: 'age' | 'all' = 'age';
  public activities: IActivityEntity[] | [] = [];

  constructor(public dialogRef: MatDialogRef<any>, public programService: ProgramService, private ut: UtilityService, private goalService: GoalService, private dialog: MatDialog) {
  }

  ngOnInit(): void {
    if (this.programService.programs.value.length === 0)
      this.programService.fetch(true)
  }

  onSelectionChangeProgram(value: IProgramEntity | undefined) {
    if (value != null) {
      this.programService.fetchOne(value.id, true)//fetchOne will return the program with its activities
        .then((v) => {
          this.chosenProgram = v;
          this.filterActivities();
        })
    }
  }

  onSelectionChangeActivity(chosenActivity: IActivityEntity | undefined) {
    if (chosenActivity != null)
      this.dialogRef.close(chosenActivity);
  }

  filterActivities(filter?: 'age' | 'all') {
    if (filter == null)
      filter = this.filter;
    else this.filter = filter;
    if (filter !== 'all' &&
      this.chosenProgram?.activities &&
      this.goalService.childItsGoals.value?.person?.birthDate) { //filter by age
      var age = this.ut.calcAge(this.goalService.childItsGoals.value.person.birthDate)
      this.activities = this.chosenProgram.activities
        .filter((v) => {
          if (v.maxAge != null && v.minAge != null && age < v.maxAge && age > v.minAge)
            return true;
          return false;
        });
    }
    else {//no filter
      if (this.chosenProgram?.activities)
        this.activities = this.chosenProgram.activities;
    }
  }

  createSpecialActivity() {
    this.dialog.open<AddEditActivityComponent, undefined, IActivityEntity>(AddEditActivityComponent)
      .afterClosed().subscribe(v => {
        if (typeof v === 'object')
          this.dialogRef.close(v);
      })
  }
}
