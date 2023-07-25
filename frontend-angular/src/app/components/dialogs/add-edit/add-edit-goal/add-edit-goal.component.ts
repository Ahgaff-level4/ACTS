import { Component, Inject, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { GoalService } from 'src/app/services/CRUD/goal.service';
import { IActivityEntity, IChildEntity, IGoalEntity } from '../../../../../../../interfaces';
import { SelectActivityComponent } from '../../select-activity/select-activity.component';
import { BehaviorSubject, Subscription } from 'rxjs';
import { UnsubOnDestroy } from 'src/app/unsub-on-destroy';
import { FormService } from 'src/app/services/form.service';
import { NotificationService } from 'src/app/services/notification.service';
import { PrivilegeService } from 'src/app/services/privilege.service';

@Component({
  selector: 'app-add-edit-goal',
  templateUrl: './add-edit-goal.component.html',
  styleUrls: ['./add-edit-goal.component.scss']
})
export class AddEditGoalComponent extends UnsubOnDestroy implements OnDestroy {
  public formGroup!: FormGroup;
  public selectedActivity: IActivityEntity | undefined;
  /**Used when adding new goal */
  public child$ = new BehaviorSubject<IChildEntity | undefined>(undefined);

  /** used to add/edit goal base on `goalOrChildId` type:
   * - Either goal to be edit.
   * - Or childId to add the new goal into it */
  constructor(private fb: FormBuilder, public service: GoalService, public goalService: GoalService,
    private pr:PrivilegeService, public dialogRef: MatDialogRef<any>,
    public formService: FormService, private nt: NotificationService,
    @Inject(MAT_DIALOG_DATA) public goalOrChildId: IGoalEntity | number,) {
    super();
  }

  ngOnInit(): void {
    this.formGroup = this.fb.group({
      note: [null, [Validators.maxLength(512)]],
      /**state is 'continual' when create a goal*/
      state: ['continual', [Validators.required,]],
      activityId: [null, [Validators.required, Validators.min(0),]],
      assignDatetime: [new Date(), [Validators.required]],
    });

    this.child$ = this.goalService.childItsGoals$;

    if (typeof this.goalOrChildId === 'object') {
      this.formGroup.setValue(this.formService.extractFrom(this.formGroup.controls, this.goalOrChildId));
      this.selectedActivity = this.goalOrChildId?.activity;
    }
  }


  public async submit(event: SubmitEvent): Promise<any> {
    event.preventDefault();
    this.formService.trimFormGroup(this.formGroup);
    this.formGroup.markAllAsTouched();
    if (this.formGroup.valid) {
      this.formGroup.disable();
      if (typeof this.goalOrChildId == 'number') {//add new
        if (this.child$.value?.id == undefined || this.pr.user.value?.accountId == undefined)
          return this.nt.errorDefaultDialog();
        try {
          await this.service.post({ ...this.formGroup.value, childId: this.child$.value.id, teacherId: this.pr.user.value.accountId }, true);
          this.nt.notify("Added successfully", 'The goal has been added successfully', 'success');
          this.dialogRef.close('added');
        } catch (e) { }
      } else if (typeof this.goalOrChildId == 'object') {//edit
        let dirtyControls = this.formService.extractDirty(this.formGroup.controls);
        try {
          if (dirtyControls != null)
            await this.service.patch(this.goalOrChildId.id, dirtyControls, true);
          this.nt.notify("Edited successfully", 'The goal has been edited successfully', 'success');
          this.dialogRef.close('edited');
        } catch (e) { }
      } else this.nt.errorDefaultDialog().afterClosed().subscribe(() => this.dialogRef.close())
      this.formGroup.enable();
    } else this.nt.notify('Invalid Field', 'There are invalid fields!', 'error');
  }

  selectActivity() {
    if (!this.child$.value)
      this.nt.notify(undefined);
    else
      this.nt.openDialog<SelectActivityComponent, { child: IChildEntity, state: 'goal' | 'strength' }, IActivityEntity>(SelectActivityComponent, { child: this.child$.value, state: 'goal' })
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
