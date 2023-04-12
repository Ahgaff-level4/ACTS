import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ActivityService } from 'src/app/services/activity.service';
import { UtilityService } from 'src/app/services/utility.service';
import { IActivityEntity, IFieldEntity } from '../../../../../../interfaces';
import { FieldService } from 'src/app/services/field.service';

@Component({
  selector: 'app-add-edit-activity',
  templateUrl: './add-edit-activity.component.html',
  styleUrls: ['./add-edit-activity.component.scss']
})
export class AddEditActivityComponent {
  public formGroup: FormGroup;
  protected minlength = { minlength: 3 };
  protected nowDate = new Date();

  constructor(private fb: FormBuilder, public service: ActivityService, public fieldService: FieldService, private ut: UtilityService, public dialogRef: MatDialogRef<any>,/**Either activity to be edit. Or programId to add the new activity into it */ @Inject(MAT_DIALOG_DATA) public activityProgramId?: IActivityEntity | number,) {
    this.formGroup = this.fb.group({
      name: [null, [Validators.required, Validators.maxLength(512), Validators.minLength(3)]],
      minAge: [null, [Validators.required, Validators.min(0), Validators.max(99)]],
      maxAge: [null, [Validators.required, Validators.min(0), Validators.max(99)]],
      fieldId: [null, Validators.min(0)],
      createdDatetime: [new Date(), [Validators.required]],
    });
    if (this.fieldService.fields.value.length === 0) {
      this.ut.isLoading = true;
      this.fieldService.fetch().finally(() => this.ut.isLoading = false);
    }
    if (typeof this.activityProgramId != 'number' && typeof this.activityProgramId != 'object')
      this.ut.errorDefaultDialog().afterClosed().subscribe(() => this.dialogRef.close());
  }

  ngOnInit(): void {
    if (typeof this.activityProgramId === 'object' && typeof this.activityProgramId != 'number' && this.activityProgramId)
      this.formGroup.setValue(this.ut.extractFrom(this.formGroup.controls, this.activityProgramId));
  }


  public async submit(event: SubmitEvent) {
    event.preventDefault();
    this.ut.trimFormGroup(this.formGroup);
    this.formGroup.markAllAsTouched();
    if (this.formGroup.valid) {
      this.formGroup.disable();
      if (typeof this.activityProgramId == 'number') {//add new
        await this.service.post({ ...this.formGroup.value, programId: this.activityProgramId });
        this.ut.showMsgDialog({ type: 'success', title: 'Added successfully!', content: 'The activity has been added successfully.' })
          .afterClosed().subscribe({ next: () => this.dialogRef.close('added') });
      } else if (typeof this.activityProgramId == 'object') {//edit
        let dirtyControls = this.ut.extractDirty(this.formGroup.controls);
        if (dirtyControls != null)
          await this.service.patch(this.activityProgramId.id, dirtyControls);
        this.ut.showMsgDialog({ type: 'success', title: 'Edited successfully!', content: 'The activity has been edited successfully.' })
          .afterClosed().subscribe({ next: () => this.dialogRef.close('edited') });
      }else this.ut.errorDefaultDialog().afterClosed().subscribe(()=>this.dialogRef.close())
      this.formGroup.enable();
    } else this.ut.showMsgDialog({ title: 'Invalid Field', type: 'error', content: 'There are invalid fields!' })
  }

}
