import { HttpClient, HttpEventType, HttpResponse } from '@angular/common/http';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { finalize } from 'rxjs';
import { UtilityService } from 'src/app/services/utility.service';
import { environment } from 'src/environments/environment';
import { PasswordDialogComponent } from '../../dialogs/password-dialog/password-dialog.component';
import { PrivilegeService } from 'src/app/services/privilege.service';
import { DisplayService } from 'src/app/services/display.service';
import { NotificationService } from 'src/app/services/notification.service';
@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent {
  // public language: 'Arabic' | 'English' = this.translate.currentLang == 'ar' ? 'English' : 'Arabic';
  @ViewChild('fileInput') fileInput!: ElementRef;
  public uploadProgress: number | null = null;
  public API = environment.API;

  constructor(public pr: PrivilegeService, public translate: TranslateService,
    public ut: UtilityService, private http: HttpClient, private dialog: MatDialog,
    public display: DisplayService, public nt:NotificationService) { }


  restore() {
    this.nt.showMsgDialog({
      type: 'confirm',
      content: 'NOTE: The restore process will replace/overwrite your current database with the backup version. Any current data that is not exist in the backup version will be lost!',
      buttons: [{ color: 'primary', type: 'Cancel' }, { color: 'warn', type: 'Continue' }]
    }).afterClosed().subscribe(v => {
      if (v === 'Continue') {
        this.fileInput.nativeElement.click();
      }
    })
  }

  onFileSelected(event: Event) {
    const files = (event.target as HTMLInputElement)?.files;
    const file = files && files[0];
    if (file == null)
      return;
    const formData = new FormData();
    formData.append('backup', file);

    this.http.post(environment.API + 'restore', formData, { reportProgress: true, observe: 'events' })
      .pipe(finalize(() => this.uploadProgress = null))
      .subscribe({
        next: (event: any) => {
          if (typeof event.loaded == 'number') {
            this.uploadProgress = Math.round(100 * (event.loaded / (event.total ?? 1)));
          } else if (event instanceof HttpResponse && event.body.success) {
            this.nt.notify("Restored successfully", 'Database restored successfully', 'success');
            this.uploadProgress = null;
          }

        },
        error: (error) => this.nt.errorDefaultDialog(error, 'There was a problem while restoring the database!')
      });
  }

  changePassword() {
    this.dialog.open(PasswordDialogComponent, { direction: this.ut.getDirection() });
  }

  closeAfter = this.nt.notificationSettings.value.closeAfter / 1000;
  /**
   *
   * @param value is:
   * - boolean if showNotification changed.
   * - KeyUp event for CloseAfter
   * - Change event for CloseAfter
   */
  changeNotification(value: any) {
    if (typeof value == 'boolean')
      this.nt.notificationSettings.next({ ...this.nt.notificationSettings.value, showNotification: value });
    else {
      if (value.target?.value!)
        this.closeAfter = Number(value.target.value);
      this.nt.notificationSettings.next({ ...this.nt.notificationSettings.value, closeAfter: Number(this.closeAfter) * 1000 });
    }

    localStorage.setItem('notifySettings', JSON.stringify(this.nt.notificationSettings.value));
  }

}
