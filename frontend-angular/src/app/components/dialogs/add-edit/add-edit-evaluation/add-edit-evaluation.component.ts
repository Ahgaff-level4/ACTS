import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { EvaluationService } from 'src/app/services/CRUD/evaluation.service';
import { IEvaluationEntity } from '../../../../../../../interfaces';
import { FormService } from 'src/app/services/form.service';
import { NotificationService } from 'src/app/services/notification.service';
import { PrivilegeService } from 'src/app/services/privilege.service';

@Component({
  selector: 'app-add-edit-evaluation',
  templateUrl: './add-edit-evaluation.component.html',
  styleUrls: ['./add-edit-evaluation.component.scss']
})
export class AddEditEvaluationComponent {
  public formGroup!: FormGroup;
  protected minlength = { minlength: 3 };
  protected nowDate = new Date();
  constructor(private fb:FormBuilder, public service: EvaluationService, private pr:PrivilegeService,
    public dialogRef: MatDialogRef<any>, private formService: FormService,private nt:NotificationService,
    /** @param data is either an evaluation to be Edit. Or goalId to be Add */
    @Inject(MAT_DIALOG_DATA) public evaluationOrGoalId?: IEvaluationEntity | number,) {
  }


  ngOnInit(): void {
    this.formGroup = this.fb.group({
      description: [null, [Validators.required, Validators.maxLength(512), Validators.minLength(3)]],
      mainstream: [null, [Validators.maxLength(512)]],
      note: [null, [Validators.maxLength(512)]],
      rate: [null, [Validators.required]],
      teacherId: [this.pr.user.value?.accountId, [Validators.required]],
      evaluationDatetime: [new Date(), [Validators.required]],
    });

    if (typeof this.evaluationOrGoalId === 'object')
      this.formGroup.setValue(this.formService.extractFrom(this.formGroup.controls, this.evaluationOrGoalId));
    else this.formGroup.addControl('goalId', this.fb.control(this.evaluationOrGoalId));
  }


  public async submit(event: SubmitEvent) {
    event.preventDefault();
    this.formService.trimFormGroup(this.formGroup);
    this.formGroup.markAllAsTouched();
    if (this.formGroup.valid) {
      this.formGroup.disable();
      if (typeof this.evaluationOrGoalId === 'number') {//add new
        try {

          await this.service.post(this.formGroup.value);
          this.nt.notify('Added successfully', 'The evaluation has been added successfully', 'success')
          this.dialogRef.close();
        } catch (e) { }
      } else if (typeof this.evaluationOrGoalId === 'object') {//edit
        let dirtyFields = this.formService.extractDirty(this.formGroup.controls);
        try {
          if (dirtyFields != null)
            await this.service.patch(this.evaluationOrGoalId.id, dirtyFields);
          this.nt.notify('Edited successfully', 'The evaluation has been edited successfully', 'success')
          this.dialogRef.close();
        } catch (e) { }
      }
      this.formGroup.enable();
    } else this.nt.notify('Invalid Field', 'There are invalid fields!', 'error');
  }

}
