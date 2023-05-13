import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { GoalService } from 'src/app/services/goal.service';
import { UtilityService } from 'src/app/services/utility.service';
import { IActivityEntity, IGoalEntity } from '../../../../../../../interfaces';
import { SelectActivityComponent } from '../../select-activity/select-activity.component';

@Component({
  selector: 'app-add-edit-goal',
  templateUrl: './add-edit-goal.component.html',
  styleUrls: ['./add-edit-goal.component.scss']
})
export class AddEditGoalComponent {
  public formGroup!: FormGroup;
  protected minlength = { minlength: 3 };
  protected nowDate = new Date();
  public selectedActivity: IActivityEntity | undefined;

  constructor(private fb: FormBuilder, public service: GoalService, public goalService: GoalService,
    private ut: UtilityService, public dialogRef: MatDialogRef<any>, private dialog: MatDialog,
    /**Either goal to be edit. Or childId to add the new goal into it */
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

    if (typeof this.goalService.childItsGoals.value != 'object')
      this.ut.errorDefaultDialog().afterClosed().subscribe(() => this.dialogRef.close());

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
        if (this.goalService.childItsGoals.value?.id == null || this.ut.user.value?.accountId == null)
          return this.ut.errorDefaultDialog();
        try {
          await this.service.post({ ...this.formGroup.value, childId: this.goalService.childItsGoals.value?.id, teacherId: this.ut.user.value?.accountId });
          this.ut.showSnackbar('The goal has been added successfully.');
          this.dialogRef.close('added');
        } catch (e) { }
      } else if (typeof this.goalOrChildId == 'object') {//edit
        let dirtyControls = this.ut.extractDirty(this.formGroup.controls);
        try {
          if (dirtyControls != null)
            await this.service.patch(this.goalOrChildId.id, dirtyControls);
          this.ut.showSnackbar('The goal has been edited successfully.');
          this.dialogRef.close('edited');
        } catch (e) { }
      } else this.ut.errorDefaultDialog().afterClosed().subscribe(() => this.dialogRef.close())
      this.formGroup.enable();
    } else this.ut.showMsgDialog({ title: { text: 'Invalid Field' }, type: 'error', content: 'There are invalid fields!' })
  }

  selectActivity() {
    this.dialog.open<SelectActivityComponent, null, IActivityEntity>(SelectActivityComponent)
      .afterClosed().subscribe(v => {
        if (v != null) {
          this.formGroup.get('activityId')?.setValue(v.id);
          this.formGroup.get('activityId')?.markAsDirty();
          this.selectedActivity = v;
        }
        else this.formGroup.get('activityId')?.setErrors({ dirty: true })
      });
  }

}
