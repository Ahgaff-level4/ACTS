import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { LoginService } from 'src/app/services/login.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  constructor(private loginService: LoginService) { }
  public formGroup = new FormGroup({
    username: new FormControl('', { validators: [Validators.required, Validators.maxLength(30)], nonNullable: true }),
    password: new FormControl('', { validators: [Validators.required,], nonNullable: true }),
  });

  submit() {
    const { username, password } = this.formGroup.controls;
    this.loginService.login(username.value, password.value)
  }
}
