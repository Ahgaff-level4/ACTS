import { Component, Input } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LoginService } from 'src/app/services/login.service';
import { NotificationService } from 'src/app/services/notification.service';

@Component({
  selector: 'app-header-actions[isLoggedIn]',
  templateUrl: './header-actions.component.html',
  styleUrls: ['./header-actions.component.scss']
})
export class HeaderActionsComponent {
  @Input() isLoggedIn: boolean = false;
  constructor(public loginService: LoginService, public nt: NotificationService,
    public translate: TranslateService,) { }

}
