import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ProgramService } from 'src/app/services/CRUD/program.service';
import { IProgramEntity } from '../../../../../../../interfaces';
import { FormService } from 'src/app/services/form.service';
import { NotificationService } from 'src/app/services/notification.service';

@Component({
  selector: 'app-add-edit-program',
  templateUrl: './add-edit-program.component.html',
  styleUrls: ['./add-edit-program.component.scss']
})
export class AddEditProgramComponent {
  public formGroup: FormGroup;
  protected minlength = { minlength: 3 };
  protected nowDate = new Date();
  constructor(private fb:FormBuilder, public service: ProgramService,
    private formService: FormService, public dialogRef: MatDialogRef<any>,private nt:NotificationService,
    @Inject(MAT_DIALOG_DATA) public program?: IProgramEntity) {
    this.formGroup = this.fb.group({
      name: [null, [Validators.required, Validators.maxLength(50), Validators.minLength(3)]],
      createdDatetime: [new Date(), [Validators.required]],
    });
  }

  ngOnInit(): void {
    if (this.program)
      this.formGroup.setValue(this.formService.extractFrom(this.formGroup.controls, this.program));
  }


  public async submit(event: SubmitEvent) {
    event.preventDefault();
    this.formService.trimFormGroup(this.formGroup);
    this.formGroup.markAllAsTouched();
    if (this.formGroup.valid) {
      this.formGroup.disable();
      if (this.program?.id == null) {//add new
        try {
          await this.service.post(this.formGroup.value);
          this.nt.notify("Added successfully", 'The program has been added successfully', 'success');
          this.dialogRef.close();
        } catch (e) { }
      } else {//edit
        let dirtyProgram = this.formService.extractDirty(this.formGroup.controls);
        try {
          if (dirtyProgram != null)
            await this.service.patch(this.program.id, dirtyProgram);
          this.nt.notify("Edited successfully", 'The program has been edited successfully', 'success');
          this.dialogRef.close();
        } catch (e) { }
      }
      this.formGroup.enable();
    } else this.nt.notify('Invalid Field', 'There are invalid fields!', 'error');
  }

}
