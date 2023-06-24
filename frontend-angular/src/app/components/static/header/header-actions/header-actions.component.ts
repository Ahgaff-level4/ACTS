import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LoginService } from 'src/app/services/login.service';
import { NotificationService } from 'src/app/services/notification.service';
import { UtilityService } from 'src/app/services/utility.service';

@Component({
  selector: 'app-header-actions',
  templateUrl: './header-actions.component.html',
  styleUrls: ['./header-actions.component.scss']
})
export class HeaderActionsComponent {
  @Output() hideHeader = new EventEmitter<void>();//used for small screen
  constructor(public loginService: LoginService, public nt: NotificationService,
    public translate: TranslateService,public ut:UtilityService) { }

}
