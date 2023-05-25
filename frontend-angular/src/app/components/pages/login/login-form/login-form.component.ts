import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { LoginService } from 'src/app/services/login.service';
import { UtilityService } from 'src/app/services/utility.service';

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss']
})
export class LoginFormComponent {
  public hide: boolean = true;//used to hide password
  /**
   * Used in:
   * - login page.
   * - as dialog.
   */
  constructor(private loginService: LoginService, private ut: UtilityService) { }

  public formGroup = new FormGroup({
    username: new FormControl('', { validators: [Validators.required, Validators.maxLength(30), Validators.minLength(4),], nonNullable: true }),
    password: new FormControl('', { validators: [Validators.required, Validators.maxLength(1024), Validators.minLength(4)], nonNullable: true }),
    isRememberMe: new FormControl(true, { validators: [Validators.required,] }),
  });
  public minlength = { minlength: 4 }

  public submit() {
    const { username, password, isRememberMe } = this.formGroup.controls;
    this.formGroup.disable();
    this.loginService.login(username.value.trim(), password.value, isRememberMe.value || true, () => {
      this.formGroup.enable();
      //todo redirect to previous page ?? '/main'
        this.ut.router.navigate(['main']);
    })
  }

  public showForgetPasswordDialog() {
    this.ut.showMsgDialog({
      type: 'info',
      title: { text: 'Forget the password?', icon: 'info' },
      content: `Call the administrator to reset your password. If you are the administrator then try to access the system with another account that has Admin privilege, so that you can reset this account password. If nothing of the previous steps works then try to contact the technician who set up this system.`
    })
  }
}
