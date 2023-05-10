import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ProgramService } from 'src/app/services/program.service';
import { UtilityService } from 'src/app/services/utility.service';
import { IProgramEntity } from '../../../../../../../interfaces';

@Component({
  selector: 'app-add-edit-program',
  templateUrl: './add-edit-program.component.html',
  styleUrls: ['./add-edit-program.component.scss']
})
export class AddEditProgramComponent {
  public formGroup: FormGroup;
  protected minlength = { minlength: 3 };
  protected nowDate = new Date();
  constructor(private fb: FormBuilder, public service: ProgramService, private ut: UtilityService, public dialogRef: MatDialogRef<any>, @Inject(MAT_DIALOG_DATA) public program?: IProgramEntity,) {
    this.formGroup = this.fb.group({
      name: [null, [Validators.required, Validators.maxLength(50), Validators.minLength(3)]],
      createdDatetime: [new Date(), [Validators.required]],
    });
  }

  ngOnInit(): void {
    //todo if necessary: if(this.personId){//fetch person info}
    if (this.program)
      this.formGroup.setValue(this.ut.extractFrom(this.formGroup.controls, this.program));
  }


  public async submit(event: SubmitEvent) {
    event.preventDefault();
    this.ut.trimFormGroup(this.formGroup);
    this.formGroup.markAllAsTouched();
    if (this.formGroup.valid) {
      this.formGroup.disable();
      if (this.program?.id == null) {//add new
        try {
          await this.service.post(this.formGroup.value);
          this.ut.showSnackbar('The program has been added successfully.')
          this.dialogRef.close();
        } catch (e) { }
      } else {//edit
        let dirtyProgram = this.ut.extractDirty(this.formGroup.controls);
        try {
          if (dirtyProgram != null)
            await this.service.patch(this.program.id, dirtyProgram);
          this.ut.showSnackbar('The program has been edited successfully.');
          this.dialogRef.close();
        } catch (e) { }
      }
      this.formGroup.enable();
    } else this.ut.showMsgDialog({ title: { text: 'Invalid Field' }, type: 'error', content: 'There are invalid fields!' })
  }

}
