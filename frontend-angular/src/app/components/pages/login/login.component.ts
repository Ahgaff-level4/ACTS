import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { LoginService } from 'src/app/services/login.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  public hide: boolean = true;//used to hide password
  constructor(private loginService: LoginService) { }
  public formGroup = new FormGroup({
    username: new FormControl('', { validators: [Validators.required, Validators.maxLength(30)], nonNullable: true }),
    password: new FormControl('', { validators: [Validators.required,], nonNullable: true }),
    isRememberMe: new FormControl(true, { validators: [Validators.required,] }),
  });

  submit() {
    const { username, password,isRememberMe } = this.formGroup.controls;
    this.loginService.login(username.value, password.value,isRememberMe.value||true);
  }
}
