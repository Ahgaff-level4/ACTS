import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormService } from 'src/app/services/form.service';
import { NotificationService, OnlineAccount } from 'src/app/services/notification.service';

@Component({
  selector: 'app-send-message',
  templateUrl: './send-message.component.html',
  styleUrls: ['./send-message.component.scss']
})
export class SendMessageComponent implements OnInit {
  public formGroup = this.fb.group({
    message: [null, [Validators.required, Validators.minLength(3)]],
  });
  constructor(private dialogRef: MatDialogRef<any>, private fb: FormBuilder,
    public nt: NotificationService,
    /**State:
     * 1- account exist: then it is 'sent notification message' privately to single account.
     * 2- account is undefined: then it is 'broadcast message' sent to all online accounts.
     */
    @Inject(MAT_DIALOG_DATA) public account?: OnlineAccount) { }

  ngOnInit(): void {
    if (!this.account && !this.nt.onlineAccounts.value) {
      this.nt.notify(undefined);
      this.dialogRef.close();
    }
  }
  send() {
    this.formGroup.disable();
    //todo some code
    this.dialogRef.close();
    //todo some code
    this.formGroup.enable();
  }
}
