import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { IFieldEntity } from '../../../../../../interfaces';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FieldService } from 'src/app/services/field.service';
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
    //todo if necessary: if(this.personId){//fetch person info}
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
        await this.service.post(this.formGroup.value);
        this.ut.showSnackbar('The field has been added successfully.')
        this.dialogRef.close();
      } else {//edit
        let dirtyFields = this.ut.extractDirty(this.formGroup.controls);
        if (dirtyFields != null)
          await this.service.patch(this.field.id, dirtyFields);
        this.ut.showSnackbar('The field has been edited successfully.')
        this.dialogRef.close();
      }
      this.formGroup.enable();
    } else this.ut.showMsgDialog({ title: {text:'Invalid Field'}, type: 'error', content: 'There are invalid fields!' })
  }

}
