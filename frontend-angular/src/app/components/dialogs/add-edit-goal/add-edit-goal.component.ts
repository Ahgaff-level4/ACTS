import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ChildService } from 'src/app/services/child.service';
import { GoalService } from 'src/app/services/goal.service';
import { UtilityService } from 'src/app/services/utility.service';
import { IGoalEntity } from '../../../../../../interfaces';
import { ProgramService } from 'src/app/services/program.service';

@Component({
  selector: 'app-add-edit-goal',
  templateUrl: './add-edit-goal.component.html',
  styleUrls: ['./add-edit-goal.component.scss']
})
export class AddEditGoalComponent {
  public formGroup: FormGroup;
  protected minlength = { minlength: 3 };
  protected nowDate = new Date();

  constructor(private fb: FormBuilder, public service: GoalService,public programService:ProgramService, public childService: ChildService,
    private ut: UtilityService, public dialogRef: MatDialogRef<any>,
    /**Either goal to be edit. Or childId to add the new goal into it */
    @Inject(MAT_DIALOG_DATA) public goalChildId?: IGoalEntity | number,) {
    this.formGroup = this.fb.group({
      //state is 'continual' when create a goal
      note: [null, [Validators.required, Validators.maxLength(512), Validators.minLength(3)]],
      activityId: [null, [Validators.required, Validators.min(0),]],
      fieldId: [null, Validators.min(0)],
      assignDatetime: [new Date(), [Validators.required]],
    });
    if (this.programService.programs.value.length === 0) {
      this.ut.isLoading.next(true);
      this.programService.fetch().finally(() => this.ut.isLoading.next(false));
    }
    if (typeof this.goalChildId != 'number' && typeof this.goalChildId != 'object')
      this.ut.errorDefaultDialog().afterClosed().subscribe(() => this.dialogRef.close());
  }

  ngOnInit(): void {
    if (typeof this.goalChildId === 'object' && typeof this.goalChildId != 'number' && this.goalChildId)
      this.formGroup.setValue(this.ut.extractFrom(this.formGroup.controls, this.goalChildId));
  }


  public async submit(event: SubmitEvent) {
    event.preventDefault();
    this.ut.trimFormGroup(this.formGroup);
    this.formGroup.markAllAsTouched();
    if (this.formGroup.valid) {
      this.formGroup.disable();
      if (typeof this.goalChildId == 'number') {//add new
        await this.service.post({ ...this.formGroup.value, state: 'continual', childId: this.goalChildId, });
        this.ut.showSnackbar('The activity has been added successfully.');
        this.dialogRef.close('added');
      } else if (typeof this.goalChildId == 'object') {//edit
        let dirtyControls = this.ut.extractDirty(this.formGroup.controls);
        if (dirtyControls != null)
          await this.service.patch(this.goalChildId.id, dirtyControls);
        this.ut.showSnackbar('The activity has been edited successfully.');
        this.dialogRef.close('edited');
      } else this.ut.errorDefaultDialog().afterClosed().subscribe(() => this.dialogRef.close())
      this.formGroup.enable();
    } else this.ut.showMsgDialog({ title: 'Invalid Field', type: 'error', content: 'There are invalid fields!' })
  }

  selectActivity(){
    //todo open a dialog so the user select a program then another dialog for user to select an activity
  }

}
