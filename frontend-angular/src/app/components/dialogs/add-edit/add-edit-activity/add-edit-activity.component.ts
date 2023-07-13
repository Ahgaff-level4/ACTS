import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ActivityService } from 'src/app/services/CRUD/activity.service';
import { IActivityEntity } from '../../../../../../../interfaces';
import { FieldService } from 'src/app/services/CRUD/field.service';
import { UnsubOnDestroy } from 'src/app/unsub-on-destroy';
import { FormService } from 'src/app/services/form.service';
import { NotificationService } from 'src/app/services/notification.service';

@Component({
  selector: 'app-add-edit-activity',
  templateUrl: './add-edit-activity.component.html',
  styleUrls: ['./add-edit-activity.component.scss']
})
export class AddEditActivityComponent extends UnsubOnDestroy {
  public formGroup!: FormGroup;
  protected minlength = { minlength: 3 };
  protected nowDate = new Date();
  public isSpecialActivity!: boolean;
  // public fields: IFieldEntity[] | undefined;
  constructor(private fb: FormBuilder, public service: ActivityService, public fieldService: FieldService,
    public dialogRef: MatDialogRef<any>, private formService: FormService,
    private nt: NotificationService,
    /**passed data could be:
     * 1- `activity` to be edit. If activity.programId == null THEN it is special activity
     * 2- `programId` to add the new activity into it.
     * 3- `undefined` to add new special activity without program and should return the IActivityEntity after post*/
    @Inject(MAT_DIALOG_DATA) public activityProgramId?: IActivityEntity | number,) {
    super();
  }

  ngOnInit(): void {
    console.log('activityProgramId', this.activityProgramId);
    this.isSpecialActivity = this.activityProgramId == undefined || (typeof this.activityProgramId == 'object' && this.activityProgramId.programId == null)
    let ages = this.isSpecialActivity ? {} : {//special activity don't need age stuff
      minAge: [null, [Validators.required, Validators.min(0), Validators.max(99)]],
      maxAge: [null, [Validators.required, Validators.min(0), Validators.max(99)]],
    };
    this.formGroup = this.fb.group({
      name: [null, [Validators.required, Validators.maxLength(512), Validators.minLength(3),]],
      ...ages,
      fieldId: [null, [Validators.required, Validators.min(0)]],
      createdDatetime: [new Date(), [Validators.required]],
    });
    // this.sub.add(this.fieldService.fields.subscribe(v => this.fields = v));
    if (typeof this.activityProgramId === 'object' && typeof this.activityProgramId != 'number' && this.activityProgramId)
      this.formGroup.setValue(this.formService.extractFrom(this.formGroup.controls, this.activityProgramId));
  }


  public async submit(event: SubmitEvent) {
    event.preventDefault();
    this.formService.trimFormGroup(this.formGroup);
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
          this.nt.notify('Added successfully', 'The activity has been added successfully', 'success');
          this.dialogRef.close(this.activityProgramId ? 'added' : newActivity);
        } catch (e) { }
      } else if (typeof this.activityProgramId == 'object') {//edit. activityProgramId type in this scope `IActivityEntity` and its programId type `number|undefined`
        let dirtyControls = this.formService.extractDirty(this.formGroup.controls);
        try {

          if (dirtyControls != null) {
            if (this.activityProgramId.programId)
              await this.service.patchInProgramItsActivities(this.activityProgramId.id, dirtyControls, true);
            else
              await this.service.patchInSpecialActivities(this.activityProgramId.id, dirtyControls, true);
          }
          this.nt.notify('Edited successfully', 'The activity has been edited successfully', 'success');
          this.dialogRef.close('edited');
        } catch (e) { }
      } else this.nt.errorDefaultDialog().afterClosed().subscribe(() => this.dialogRef.close())
      this.formGroup.enable();
    } else this.nt.notify('Invalid Field', 'There are invalid fields!', 'error');
  }

}
