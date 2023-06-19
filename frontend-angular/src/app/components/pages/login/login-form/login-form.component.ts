import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { LoginService } from 'src/app/services/login.service';
import { UtilityService } from 'src/app/services/utility.service';
import { User } from '../../../../../../../interfaces';
import { NotificationService } from 'src/app/services/notification.service';

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss']
})
export class LoginFormComponent implements OnInit {
  public hide: boolean = true;//used to hide password
  public minlength = { minlength: 4 }
  public formGroup = new FormGroup({
    username: new FormControl('', { validators: [Validators.required, Validators.maxLength(30), Validators.minLength(4),], nonNullable: true }),
    password: new FormControl('', { validators: [Validators.required, Validators.maxLength(1024), Validators.minLength(4)], nonNullable: true }),
    isRememberMe: new FormControl(true, { validators: [Validators.required,] }),
  });
  /**
   * Used in:
   * - login page.
   * - as dialog.
   */
  constructor(private loginService: LoginService, private ut: UtilityService,
    private nt:NotificationService,) { }

  ngOnInit(): void {
    this.ut.user.next(null);//if user redirect here he should not be considered logged in anymore.
  }

  public submit() {
    const { username, password, isRememberMe } = this.formGroup.controls;
    this.formGroup.disable();
    this.loginService.login(username.value.trim(), password.value, isRememberMe.value || true)
      .subscribe({
        next: (v: User) => {
          if (typeof v.accountId === 'number' && Array.isArray(v.roles)) {
            this.ut.user.next(v);
            //todo redirect to previous page ?? '/main'
            this.ut.router.navigate(['main']);
          } else this.nt.errorDefaultDialog(v as any);
        }, error: e => {
          this.nt.errorDefaultDialog(e);
        }, complete: () => this.formGroup.enable()
      })
  }

  public showForgetPasswordDialog() {
    this.nt.showMsgDialog({
      type: 'info',
      title: { text: 'Forget the password?', icon: 'info' },
      content: `Call the administrator to reset your password. If you are the administrator then try to access the system with another account that has Admin privilege, so that you can reset this account password. If nothing of the previous steps works then try to contact the technician who set up this system.`
    })
  }
}
