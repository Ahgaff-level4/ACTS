import { Component, Inject, OnInit } from '@angular/core';
import { ProgramService } from 'src/app/services/program.service';
import { UtilityService } from 'src/app/services/utility.service';
import { IActivityEntity, IChildEntity, IFieldEntity, IProgramEntity } from '../../../../../../interfaces';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { GoalService } from 'src/app/services/goal.service';
import { AddEditActivityComponent } from '../add-edit/add-edit-activity/add-edit-activity.component';
import { ActivityService } from 'src/app/services/activity.service';
import { StrengthService } from 'src/app/services/strength.service';
import { FieldService } from 'src/app/services/field.service';
import { SelectionChangedEvent } from 'ag-grid-community';
import { UnsubOnDestroy } from 'src/app/unsub-on-destroy';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-select-activity',
  templateUrl: './select-activity.component.html',
  styleUrls: ['./select-activity.component.scss']
})
export class SelectActivityComponent extends UnsubOnDestroy implements OnInit {
  public chosenProgram: IProgramEntity | undefined;
  public filterByAgeTwoWay: 'age' | 'all' = 'age';
  public filterByFieldsTwoWay: IFieldEntity[] = [];
  public activities: IActivityEntity[] | [] = [];
  public child: IChildEntity | undefined;
  /**
   * This dialog is used in the following state:
   * - 'goal' for choosing the goal's activity.
   * - 'strength' for choosing the strength's activity.
   */
  constructor(public dialogRef: MatDialogRef<any>, public programService: ProgramService,
    private ut: UtilityService, private goalService: GoalService, private strengthService: StrengthService,
    private activityService: ActivityService, private dialog: MatDialog, public fieldService: FieldService,
    @Inject(MAT_DIALOG_DATA) public state: 'goal' | 'strength') {
    super();
  }

  ngOnInit(): void {
    if (this.state == 'goal')
      this.sub.add(this.goalService.childItsGoals.subscribe(v => this.child = v));
    else this.sub.add(this.strengthService.childItsStrengths.subscribe(v => this.child = v));
  }

  onSelectionChangeProgram(value: IProgramEntity | undefined) {
    if (value != null) {
      this.activityService.fetchProgramItsActivities(value.id, true)
        .then((v) => {
          this.chosenProgram = v;
          this.filterByAge();
        });
    }
  }

  onSelectionChangeActivity(chosenActivity: IActivityEntity | undefined) {
    if (chosenActivity != null)
      this.dialogRef.close(chosenActivity);
  }

  filterByAge(callAllFilters: boolean = true) {
    if (this.filterByAgeTwoWay == 'age' &&
      this.chosenProgram?.activities &&
      this.child?.person?.birthDate) { //filter by age
      var age = this.ut.calcAge(this.child?.person?.birthDate);
      this.activities = this.chosenProgram.activities
        .filter((v) => {
          if (v.maxAge == null || v.minAge == null || (age < v.maxAge && age > v.minAge))
            return true;
          return false;
        });
    }
    else {//no filter
      if (this.chosenProgram?.activities)
        this.activities = this.chosenProgram.activities;
    }
    if (callAllFilters)
      this.filterByFields(false);
  }

  filterByFields(callAllFilters: boolean = true) {
    if (callAllFilters)
      this.filterByAge(false);
    if (this.filterByFieldsTwoWay.length > 0)
      this.activities = this.activities.filter(a => this.filterByFieldsTwoWay.map(f => f.name).includes(a.field!.name));
  }

  createSpecialActivity() {
    this.dialog.open<AddEditActivityComponent, undefined, IActivityEntity>(AddEditActivityComponent, { direction: this.ut.getDirection() })
      .afterClosed().subscribe(v => {
        if (typeof v === 'object')
          this.dialogRef.close(v);
      });
  }
}
