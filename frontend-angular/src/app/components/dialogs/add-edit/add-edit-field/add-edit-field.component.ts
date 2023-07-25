import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { IFieldEntity } from '../../../../../../../interfaces';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FieldService } from 'src/app/services/CRUD/field.service';
import { FormService } from 'src/app/services/form.service';
import { NotificationService } from 'src/app/services/notification.service';

@Component({
  selector: 'app-add-edit-field',
  templateUrl: './add-edit-field.component.html',
  styleUrls: ['./add-edit-field.component.scss']
})
export class AddEditFieldComponent {
  public formGroup!: FormGroup;

  constructor(private fb: FormBuilder, public service: FieldService, private nt: NotificationService,
    public dialogRef: MatDialogRef<any>, public formService: FormService, @Inject(MAT_DIALOG_DATA) public field?: IFieldEntity,) {
  }

  ngOnInit(): void {
    this.formGroup = this.fb.group({
      name: [null, [Validators.required, Validators.maxLength(50), Validators.minLength(3), this.formService.validation.unique]],
      createdDatetime: [new Date(), [Validators.required]],
    });
    if (this.field)
      this.formGroup.setValue(this.formService.extractFrom(this.formGroup.controls, this.field));
  }


  public async submit(event: SubmitEvent) {
    event.preventDefault();
    this.formService.trimFormGroup(this.formGroup);
    this.formGroup.markAllAsTouched();
    if (this.formGroup.valid) {
      this.formGroup.disable();
      if (this.field?.id == null) {//add new
        try {
          await this.service.post(this.formGroup.value);
          this.nt.notify("Added successfully", 'The field has been added successfully', 'success')
          this.dialogRef.close();
        } catch (e: any) {
          if (e?.error?.code === "ER_DUP_ENTRY")
            this.formGroup.get('name')?.setErrors({ notUnique: true });
        }
      } else {//edit
        let dirtyFields = this.formService.extractDirty(this.formGroup.controls);
        try {
          if (dirtyFields != null)
            await this.service.patch(this.field.id, dirtyFields);
          this.nt.notify("Edited successfully", 'The field has been edited successfully', 'success')
          this.dialogRef.close();
        } catch (e) { }
      }
      this.formGroup.enable();
    } else this.nt.notify('Invalid Field', 'There are invalid fields!', 'error');
  }

}
