import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ActivityService } from 'src/app/services/activity.service';
import { UtilityService } from 'src/app/services/utility.service';
import { IActivityEntity } from '../../../../../../../interfaces';
import { FieldService } from 'src/app/services/field.service';

@Component({
  selector: 'app-add-edit-activity',
  templateUrl: './add-edit-activity.component.html',
  styleUrls: ['./add-edit-activity.component.scss']
})
export class AddEditActivityComponent {
  public formGroup!: FormGroup;
  protected minlength = { minlength: 3 };
  protected nowDate = new Date();
  public isSpecialActivity!: boolean
  constructor(private fb: FormBuilder, public service: ActivityService, public fieldService: FieldService, private ut: UtilityService, public dialogRef: MatDialogRef<any>,
    /**passed data could be:
     * 1- `activity` to be edit. If activity.programId == null THEN it is special activity
     * 2- `programId` to add the new activity into it.
     * 3- `undefined` to add new special activity without program and should return the IActivityEntity after post*/
    @Inject(MAT_DIALOG_DATA) public activityProgramId?: IActivityEntity | number,) {
  }

  ngOnInit(): void {
    this.isSpecialActivity = this.activityProgramId == undefined || (typeof this.activityProgramId == 'object' && this.activityProgramId.programId == null)
    let ages = this.isSpecialActivity ? {} : {//special activity don't need age stuff
      minAge: [null, [Validators.required, Validators.min(0), Validators.max(99)]],
      maxAge: [null, [Validators.required, Validators.min(0), Validators.max(99)]],
    };
    this.formGroup = this.fb.group({
      name: [null, [Validators.required, Validators.maxLength(512), Validators.minLength(3)]],
      ...ages,
      fieldId: [null, [Validators.required, Validators.min(0)]],
      createdDatetime: [new Date(), [Validators.required]],
    });
    if (this.fieldService.fields.value.length === 0)
      this.fieldService.fetch(true);
    if (typeof this.activityProgramId === 'object' && typeof this.activityProgramId != 'number' && this.activityProgramId)
      this.formGroup.setValue(this.ut.extractFrom(this.formGroup.controls, this.activityProgramId));
  }


  public async submit(event: SubmitEvent) {
    event.preventDefault();
    this.ut.trimFormGroup(this.formGroup);
    this.formGroup.markAllAsTouched();
    if (this.formGroup.valid) {
      this.formGroup.disable();
      if (typeof this.activityProgramId == 'number' || !this.activityProgramId) {//add new
        try {
          let newActivity = await this.service.post({ ...this.formGroup.value, programId: this.activityProgramId }, true);
          this.ut.showSnackbar('The activity has been added successfully.');
          this.dialogRef.close(this.activityProgramId ? 'added' : newActivity);
        } catch (e) { }
      } else if (typeof this.activityProgramId == 'object') {//edit
        let dirtyControls = this.ut.extractDirty(this.formGroup.controls);
        try {

          if (dirtyControls != null)
            await this.service.patch(this.activityProgramId.id, dirtyControls, true);
          this.ut.showSnackbar('The activity has been edited successfully.');
          this.dialogRef.close('edited');
        } catch (e) { }
      } else this.ut.errorDefaultDialog().afterClosed().subscribe(() => this.dialogRef.close())
      this.formGroup.enable();
    } else this.ut.showMsgDialog({ title: { text: 'Invalid Field' }, type: 'error', content: 'There are invalid fields!' })
  }

}
