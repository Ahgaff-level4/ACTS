import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { IFieldEntity } from '../../../../../../../interfaces';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FieldService } from 'src/app/services/CRUD/field.service';
import { UtilityService } from 'src/app/services/utility.service';

@Component({
  selector: 'app-add-edit-field',
  templateUrl: './add-edit-field.component.html',
  styleUrls: ['./add-edit-field.component.scss']
})
export class AddEditFieldComponent {
  public formGroup: FormGroup;
  protected minlength = { minlength: 3 };
  protected nowDate = new Date();
  constructor(private fb: FormBuilder, public service: FieldService, private ut: UtilityService, public dialogRef: MatDialogRef<any>, @Inject(MAT_DIALOG_DATA) public field?: IFieldEntity,) {
    this.formGroup = this.fb.group({
      name: [null, [Validators.required, Validators.maxLength(50), Validators.minLength(3)]],
      createdDatetime: [new Date(), [Validators.required]],
    });
  }

  ngOnInit(): void {
    if (this.field)
      this.formGroup.setValue(this.ut.extractFrom(this.formGroup.controls, this.field));
  }


  public async submit(event: SubmitEvent) {
    event.preventDefault();
    this.ut.trimFormGroup(this.formGroup);
    this.formGroup.markAllAsTouched();
    if (this.formGroup.valid) {
      this.formGroup.disable();
      if (this.field?.id == null) {//add new
        try {

          await this.service.post(this.formGroup.value);
          this.ut.notify("Added successfully",'The field has been added successfully','success')
          this.dialogRef.close();
        } catch (e) { }
      } else {//edit
        let dirtyFields = this.ut.extractDirty(this.formGroup.controls);
        try {
          if (dirtyFields != null)
            await this.service.patch(this.field.id, dirtyFields);
          this.ut.notify("Edited successfully",'The field has been edited successfully','success')
          this.dialogRef.close();
        } catch (e) { }
      }
      this.formGroup.enable();
    } else this.ut.notify('Invalid Field', 'There are invalid fields!', 'error');
  }

}
