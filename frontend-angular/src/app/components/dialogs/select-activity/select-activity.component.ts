import { Component, Inject, OnInit } from '@angular/core';
import { ProgramService } from 'src/app/services/CRUD/program.service';
import { DisplayService } from 'src/app/services/display.service';
import { IActivityEntity, IChildEntity, IFieldEntity, IProgramEntity } from '../../../../../../interfaces';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { GoalService } from 'src/app/services/CRUD/goal.service';
import { AddEditActivityComponent } from '../add-edit/add-edit-activity/add-edit-activity.component';
import { ActivityService } from 'src/app/services/CRUD/activity.service';
import { StrengthService } from 'src/app/services/CRUD/strength.service';
import { FieldService } from 'src/app/services/CRUD/field.service';
import { UnsubOnDestroy } from 'src/app/unsub-on-destroy';
import { NotificationService } from 'src/app/services/notification.service';

@Component({
  selector: 'app-select-activity',
  templateUrl: './select-activity.component.html',
  styleUrls: ['./select-activity.component.scss']
})
export class SelectActivityComponent extends UnsubOnDestroy implements OnInit {
  public chosenProgram: IProgramEntity | undefined;
  public filterByAgeTwoWay: 'age' | 'all' = this.data.child.person.birthDate ? 'age' : 'all';
  public filterByFieldsTwoWay: IFieldEntity[] = [];
  public activities: IActivityEntity[] | [] = [];
  /**
   * This dialog is used in the following state:
   * - 'goal' for choosing the goal's activity.
   * - 'strength' for choosing the strength's activity.
   */
  constructor(public dialogRef: MatDialogRef<any>, public programService: ProgramService,
    private display: DisplayService, private goalService: GoalService, private strengthService: StrengthService,
    private activityService: ActivityService, private nt:NotificationService, public fieldService: FieldService,
    @Inject(MAT_DIALOG_DATA) public data: { child: IChildEntity, state: 'goal' | 'strength' }) {
    super();
  }

  ngOnInit(): void {
    if (!this.data.child.goals)
      this.sub.add(this.goalService.childItsGoals$.subscribe(v => {
        if (v?.id == this.data.child.id)
          this.data.child.goals = v.goals;
        else this.goalService.fetchChildItsGoals(this.data.child.id);
      }));
    else if (!this.data.child.strengths)
      this.sub.add(this.strengthService.childItsStrengths$.subscribe(v => {
        if (v?.id == this.data.child.id)
          this.data.child.strengths = v.strengths;
        else this.strengthService.fetchChildItsStrengths(this.data.child.id);
      }))
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
      this.data.child?.person?.birthDate) { //filter by age
      var age = this.display.calcAge(this.data.child.person?.birthDate);
      this.activities = this.chosenProgram.activities
        .filter((v) => {
          if (v.maxAge == null || v.minAge == null || (age <= v.maxAge && age >= v.minAge))
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
    this.nt.openDialog<AddEditActivityComponent, undefined, IActivityEntity>(AddEditActivityComponent)
      .afterClosed().subscribe(v => {
        if (typeof v === 'object')
          this.dialogRef.close(v);
      });
  }
}
