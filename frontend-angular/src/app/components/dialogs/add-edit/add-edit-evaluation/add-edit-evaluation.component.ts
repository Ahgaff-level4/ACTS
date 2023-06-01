import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { EvaluationService } from 'src/app/services/evaluation.service';
import { UtilityService } from 'src/app/services/utility.service';
import { IEvaluationEntity } from '../../../../../../../interfaces';

@Component({
  selector: 'app-add-edit-evaluation',
  templateUrl: './add-edit-evaluation.component.html',
  styleUrls: ['./add-edit-evaluation.component.scss']
})
export class AddEditEvaluationComponent {
  public formGroup: FormGroup;
  protected minlength = { minlength: 3 };
  protected nowDate = new Date();
  constructor(private fb: FormBuilder, public service: EvaluationService, private ut: UtilityService, public dialogRef: MatDialogRef<any>,
    /** @param data is either an evaluation to be Edit. Or goalId to be Add */
    @Inject(MAT_DIALOG_DATA) public evaluationOrGoalId?: IEvaluationEntity | number,) {
    this.formGroup = this.fb.group({
      description: [null, [Validators.required, Validators.maxLength(512), Validators.minLength(3)]],
      mainstream: [null, [Validators.maxLength(512)]],
      note: [null, [Validators.maxLength(512)]],
      rate: [null, [Validators.required]],
      teacherId: [this.ut.user.value?.accountId, [Validators.required]],
      evaluationDatetime: [new Date(), [Validators.required]],
    });
  }

  ngOnInit(): void {
    if (typeof this.evaluationOrGoalId === 'object')
      this.formGroup.setValue(this.ut.extractFrom(this.formGroup.controls, this.evaluationOrGoalId));
    else this.formGroup.addControl('goalId', this.fb.control(this.evaluationOrGoalId));
    console.log(this.formGroup)
  }


  public async submit(event: SubmitEvent) {
    event.preventDefault();
    this.ut.trimFormGroup(this.formGroup);
    this.formGroup.markAllAsTouched();
    if (this.formGroup.valid) {
      this.formGroup.disable();
      if (typeof this.evaluationOrGoalId === 'number') {//add new
        try {

          await this.service.post(this.formGroup.value);
          this.ut.notify('Added successfully','The evaluation has been added successfully','success')
          this.dialogRef.close();
        } catch (e) { }
      } else if (typeof this.evaluationOrGoalId === 'object') {//edit
        let dirtyFields = this.ut.extractDirty(this.formGroup.controls);
        try {
          if (dirtyFields != null)
            await this.service.patch(this.evaluationOrGoalId.id, dirtyFields);
          this.ut.notify('Edited successfully','The evaluation has been edited successfully','success')
          this.dialogRef.close();
        } catch (e) { }
      }
      this.formGroup.enable();
    } else this.ut.notify('Invalid Field', 'There are invalid fields!', 'error');
  }

}
