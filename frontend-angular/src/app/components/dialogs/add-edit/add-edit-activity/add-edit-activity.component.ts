import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ActivityService } from 'src/app/services/activity.service';
import { UtilityService } from 'src/app/services/utility.service';
import { IActivityEntity, IFieldEntity } from '../../../../../../../interfaces';
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
  public isSpecialActivity!: boolean;
  public fields: IFieldEntity[] | undefined;
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
    this.fieldService.fields.subscribe(v => this.fields = v);
    if (typeof this.activityProgramId === 'object' && typeof this.activityProgramId != 'number' && this.activityProgramId)
      this.formGroup.setValue(this.ut.extractFrom(this.formGroup.controls, this.activityProgramId));
  }


  public async submit(event: SubmitEvent) {
    event.preventDefault();
    this.ut.trimFormGroup(this.formGroup);
    this.formGroup.markAllAsTouched();
    if (this.formGroup.valid) {
      this.formGroup.disable();
      if (typeof this.activityProgramId == 'number' || !this.activityProgramId) {//add new. activityProgramId type in this scope is `number|undefined`
        try {
          let newActivity: IActivityEntity;
          if (this.activityProgramId)
            newActivity = await this.service.postProgramItsActivities({ ...this.formGroup.value, programId: this.activityProgramId }, true);
          else
            newActivity = await this.service.postSpecialActivities({ ...this.formGroup.value, });
          this.ut.notify('Added successfully','The activity has been added successfully','success');
          this.dialogRef.close(this.activityProgramId ? 'added' : newActivity);
        } catch (e) { }
      } else if (typeof this.activityProgramId == 'object') {//edit. activityProgramId type in this scope `IActivityEntity` and its programId type `number|undefined`
        let dirtyControls = this.ut.extractDirty(this.formGroup.controls);
        try {

          if (dirtyControls != null) {
            if (this.activityProgramId.programId)
              await this.service.patchInProgramItsActivities(this.activityProgramId.id, dirtyControls, true);
            else
              await this.service.patchInSpecialActivities(this.activityProgramId.id, dirtyControls, true);
          }
          this.ut.notify('Edited successfully', 'The activity has been edited successfully','success');
          this.dialogRef.close('edited');
        } catch (e) { }
      } else this.ut.errorDefaultDialog().afterClosed().subscribe(() => this.dialogRef.close())
      this.formGroup.enable();
    } else this.ut.notify('Invalid Field', 'There are invalid fields!', 'error');
  }

}
