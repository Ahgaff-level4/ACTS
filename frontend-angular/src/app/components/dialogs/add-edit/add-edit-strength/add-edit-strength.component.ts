import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IActivityEntity, IChildEntity, IStrengthEntity } from '../../../../../../../interfaces';
import { StrengthService } from 'src/app/services/CRUD/strength.service';
import { UtilityService } from 'src/app/services/utility.service';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { SelectActivityComponent } from '../../select-activity/select-activity.component';
import { UnsubOnDestroy } from 'src/app/unsub-on-destroy';
import { FormService } from 'src/app/services/form.service';

@Component({
  selector: 'app-add-edit-strength',
  templateUrl: './add-edit-strength.component.html',
  styleUrls: ['./add-edit-strength.component.scss']
})
export class AddEditStrengthComponent extends UnsubOnDestroy {
  public formGroup!: FormGroup;
  protected minlength = { minlength: 3 };
  protected nowDate = new Date();
  public selectedActivity: IActivityEntity | undefined;
  /**Used when adding new strength */
  public child: IChildEntity | undefined;

  constructor(private fb: FormBuilder, public service: StrengthService, public strengthService: StrengthService,
    private ut: UtilityService, public dialogRef: MatDialogRef<any>, private dialog: MatDialog,
    private formService: FormService,
    /**Either goal to be edit. Or childId to add the new goal into it */
    @Inject(MAT_DIALOG_DATA) public strengthOrChildId: IStrengthEntity | number,) {
    super()
  }

  ngOnInit(): void {
    this.formGroup = this.fb.group({
      note: [null, [Validators.maxLength(512)]],
      /**state is 'continual' when create a goal*/
      state: ['strength', [Validators.required,]],
      activityId: [null, [Validators.required, Validators.min(0),]],
      assignDatetime: [new Date(), [Validators.required]],
    });

    this.sub.add(this.strengthService.childItsStrengths.subscribe(v => {
      if (v == null)
        this.ut.errorDefaultDialog().afterClosed().subscribe(() => this.dialogRef.close());
      else this.child = v;
    }));

    if (typeof this.strengthOrChildId === 'object') {
      this.formGroup.setValue(this.formService.extractFrom(this.formGroup.controls, this.strengthOrChildId));
      this.selectedActivity = this.strengthOrChildId?.activity;
    }
  }


  public async submit(event: SubmitEvent): Promise<any> {
    event.preventDefault();
    this.formService.trimFormGroup(this.formGroup);
    this.formGroup.markAllAsTouched();
    if (this.formGroup.valid) {
      this.formGroup.disable();
      if (typeof this.strengthOrChildId == 'number') {//add new
        if (this.child?.id == null || this.ut.user.value?.accountId == null)
          return this.ut.errorDefaultDialog();
        try {
          await this.service.post({ ...this.formGroup.value, childId: this.child?.id, teacherId: this.ut.user.value?.accountId }, true);
          this.ut.notify("Added successfully", 'The strength has been added successfully', 'success');
          this.dialogRef.close('added');
        } catch (e) { }
      } else if (typeof this.strengthOrChildId == 'object') {//edit
        let dirtyControls = this.formService.extractDirty(this.formGroup.controls);
        try {
          if (dirtyControls != null)
            await this.service.patch(this.strengthOrChildId.id, dirtyControls, true);
          this.ut.notify("Edited successfully", 'The strength has been edited successfully', 'success');
          this.dialogRef.close('edited');
        } catch (e) { }
      } else this.ut.errorDefaultDialog().afterClosed().subscribe(() => this.dialogRef.close())
      this.formGroup.enable();
    } else this.ut.notify('Invalid Field', 'There are invalid fields!', 'error');
  }

  selectActivity() {
    this.dialog.open<SelectActivityComponent, 'goal' | 'strength', IActivityEntity>(SelectActivityComponent, { data: 'strength', direction: this.ut.getDirection() })
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
