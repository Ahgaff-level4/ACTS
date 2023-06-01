import { Component, Inject, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { GoalService } from 'src/app/services/goal.service';
import { UtilityService } from 'src/app/services/utility.service';
import { IActivityEntity, IChildEntity, IGoalEntity } from '../../../../../../../interfaces';
import { SelectActivityComponent } from '../../select-activity/select-activity.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-add-edit-goal',
  templateUrl: './add-edit-goal.component.html',
  styleUrls: ['./add-edit-goal.component.scss']
})
export class AddEditGoalComponent implements OnDestroy {
  public formGroup!: FormGroup;
  protected minlength = { minlength: 3 };
  protected nowDate = new Date();
  public selectedActivity: IActivityEntity | undefined;
  /**Used when adding new goal */
  public child: IChildEntity | undefined;
  public sub: Subscription = new Subscription();

  /** used to add/edit goal base on `goalOrChildId` type:
   * - Either goal to be edit.
   * - Or childId to add the new goal into it */
  constructor(private fb: FormBuilder, public service: GoalService, public goalService: GoalService,
    private ut: UtilityService, public dialogRef: MatDialogRef<any>, private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public goalOrChildId: IGoalEntity | number,) {
  }

  ngOnInit(): void {
    this.formGroup = this.fb.group({
      note: [null, [Validators.maxLength(512)]],
      /**state is 'continual' when create a goal*/
      state: ['continual', [Validators.required,]],
      activityId: [null, [Validators.required, Validators.min(0),]],
      assignDatetime: [new Date(), [Validators.required]],
    });

    this.sub.add(this.goalService.childItsGoals.subscribe(v => {
      if (v == null && typeof this.goalOrChildId != 'object')
        this.ut.errorDefaultDialog().afterClosed().subscribe(() => this.dialogRef.close());
      else this.child = v;
    }));

    if (typeof this.goalOrChildId === 'object') {
      this.formGroup.setValue(this.ut.extractFrom(this.formGroup.controls, this.goalOrChildId));
      this.selectedActivity = this.goalOrChildId?.activity;
    }
  }


  public async submit(event: SubmitEvent): Promise<any> {
    event.preventDefault();
    this.ut.trimFormGroup(this.formGroup);
    this.formGroup.markAllAsTouched();
    if (this.formGroup.valid) {
      this.formGroup.disable();
      if (typeof this.goalOrChildId == 'number') {//add new
        if (this.child?.id == null || this.ut.user.value?.accountId == null)
          return this.ut.errorDefaultDialog();
        try {
          await this.service.post({ ...this.formGroup.value, childId: this.child?.id, teacherId: this.ut.user.value?.accountId }, true);
          this.ut.notify("Added successfully",'The goal has been added successfully','success');
          this.dialogRef.close('added');
        } catch (e) { }
      } else if (typeof this.goalOrChildId == 'object') {//edit
        let dirtyControls = this.ut.extractDirty(this.formGroup.controls);
        try {
          if (dirtyControls != null)
            await this.service.patch(this.goalOrChildId.id, dirtyControls, true);
          this.ut.notify("Edited successfully",'The goal has been edited successfully','success');
          this.dialogRef.close('edited');
        } catch (e) { }
      } else this.ut.errorDefaultDialog().afterClosed().subscribe(() => this.dialogRef.close())
      this.formGroup.enable();
    } else this.ut.notify('Invalid Field', 'There are invalid fields!', 'error');
  }

  selectActivity() {
    this.dialog.open<SelectActivityComponent, 'goal'|'strength', IActivityEntity>(SelectActivityComponent,{data:'goal'})
      .afterClosed().subscribe(v => {
        if (v != null) {
          this.formGroup.get('activityId')?.setValue(v.id);
          this.formGroup.get('activityId')?.markAsDirty();
          this.selectedActivity = v;
        }
        else this.formGroup.get('activityId')?.setErrors({ dirty: true })
      });
  }
  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
