//Modules
import { NgModule, isDevMode } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HTTP_INTERCEPTORS, HttpClient, HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AppMaterialModule } from './app-material.module';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { TranslateLoader, TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { AgGridModule } from 'ag-grid-angular';
import { YouTubePlayerModule } from '@angular/youtube-player';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { DetailsViewService, FileManagerModule, NavigationPaneService, ToolbarService } from '@syncfusion/ej2-angular-filemanager';
import { ServiceWorkerModule } from '@angular/service-worker';
import { NgxTimelineModule } from '@frxjs/ngx-timeline'

//Pipes
import { AccountRolesPipe } from './pipes/account-roles.pipe';
import { TeacherTeachesPipe } from './pipes/teacher-teaches.pipe';
import { ChildTeachersPipe } from './pipes/child-teachers.pipe';
import { DatePipe } from './pipes/date/date.pipe';
import { DateTimeWeekPipe } from './pipes/date/date-time-week.pipe';
import { FromNowPipe } from './pipes/date/from-now.pipe';
import { TypePipe } from './pipes/type.pipe';
import { RangePipe } from './pipes/range.pipe';
import { CalcAgePipe } from './pipes/date/calc-age.pipe';
import { DateWeekPipe } from './pipes/date/date-week.pipe';
import { AccountPhonesPipe } from './pipes/account-phones.pipe';
import { AccountPhonesArrPipe } from './pipes/account-phones-arr.pipe';
import { TitleCasePipe } from '@angular/common';

//Components
import { AppComponent } from './components/static/app/app.component';
import { HomeComponent } from './components/pages/home/home.component';
import { FieldComponent } from './components/pages/field/field.component';
import { HeaderComponent } from './components/static/header/header.component';
import { LoginComponent } from './components/pages/login/login.component';
import { FooterComponent } from './components/static/footer/footer.component';
import { ProgramComponent } from './components/pages/program/program.component';
import { ChildrenComponent } from './components/pages/children/children/children.component';
import { MessageDialogComponent } from './components/dialogs/message/message.component';
import { AddEditChildComponent } from './components/pages/children/add-edit-child/add-edit-child.component';
import { PersonFormComponent } from './components/forms/person-form/person-form.component';
import { DateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { AddEditFieldComponent } from './components/dialogs/add-edit/add-edit-field/add-edit-field.component';
import { SpinnerComponent } from './components/static/spinner/spinner.component';
import { AddEditProgramComponent } from './components/dialogs/add-edit/add-edit-program/add-edit-program.component';
import { ActivityComponent } from './components/pages/activity/activity.component';
import { AddEditActivityComponent } from './components/dialogs/add-edit/add-edit-activity/add-edit-activity.component';
import { GoalComponent } from './components/pages/goal/goal.component';
import { AddEditGoalComponent } from './components/dialogs/add-edit/add-edit-goal/add-edit-goal.component';
import { SelectActivityComponent } from './components/dialogs/select-activity/select-activity.component';
import { AccountComponent } from './components/pages/accounts/account/account.component';
import { AddEditAccountComponent } from './components/pages/accounts/add-edit-account/add-edit-account.component';
import { PasswordDialogComponent } from './components/dialogs/password-dialog/password-dialog.component';
import { EvaluationComponent } from './components/pages/evaluation/evaluation.component';
import { Page404Component } from './components/pages/404/404.component';
import { SettingsComponent } from './components/pages/settings/settings.component';
import { AddEditEvaluationComponent } from './components/dialogs/add-edit/add-edit-evaluation/add-edit-evaluation.component';
import { StrengthComponent } from './components/pages/strength/strength.component';
import { AddEditStrengthComponent } from './components/dialogs/add-edit/add-edit-strength/add-edit-strength.component';
import { WithCredentialsInterceptor } from './interceptors/WithCredentials.interceptor';
import { HttpCatchInterceptor } from './interceptors/HttpCatch.interceptor';
import { SpecialActivityComponent } from './components/pages/special-activity/special-activity.component';
import 'ag-grid-enterprise';
import { LoginFormComponent } from './components/pages/login/login-form/login-form.component';
import { ReportChildComponent } from './components/pages/children/report-child/report-child.component';
import { ViewChildComponent } from './components/pages/children/view-child/view-child.component';
import { ChildInfoComponent } from './components/pages/children/view-child/child-info/child-info.component';
import { TitleComponent } from './components/static/title/title.component';
import { ViewAccountComponent } from './components/pages/accounts/view-account/view-account.component';
import { DashboardComponent } from './components/pages/dashboard/dashboard.component';
import { SearchExportComponent } from './components/forms/search-export/search-export.component';
import { ControlButtonsComponent } from './components/forms/control-buttons/control-buttons.component';
import { HeaderActionsComponent } from './components/static/header/header-actions/header-actions.component';
import { NotificationDrawerComponent } from './components/dialogs/notification-drawer/notification-drawer.component';
import { MAT_DIALOG_DEFAULT_OPTIONS, MatDialogConfig } from '@angular/material/dialog';
import { NotificationItemComponent } from './components/dialogs/notification-drawer/notification-item/notification-item.component';
import { IconDefinition } from '@ant-design/icons-angular';
import { SendMessageComponent } from './components/dialogs/notification-drawer/send-message/send-message.component';
import { AboutUsComponent } from './components/pages/about-us/about.component';
import { CardComponent } from './components/static/card/card.component';
import { TimeframeComponent } from './components/forms/timeframe/timeframe.component';
import { PersonViewComponent } from './components/static/person-view/person-view.component';
import { ActivityItemComponent } from './components/dialogs/select-activity/activity-item/activity-item.component';
import { EntityItemComponent } from './components/static/entity-item/entity-item.component';
import { NumberCardComponent } from './components/pages/dashboard/number-card/number-card.component';
import { FileManagerComponent } from './components/static/file-manager/file-manager.component';
import { DatepickerComponent } from './components/forms/datepicker/datepicker.component';
import { AddParentComponent } from './components/dialogs/add-edit/add-parent/add-parent.component';
import { AddEditAccountFormComponent } from './components/forms/add-edit-account-form/add-edit-account-form.component';
import { RateItemComponent } from './components/pages/children/report-child/rate-item/rate-item.component';
import { VerticalTimelineComponent } from './components/pages/children/vertical-timeline/vertical-timeline.component';
import {
  BellOutline, EditOutline, DeleteOutline, PlusCircleOutline, LoginOutline,
  LogoutOutline, CheckCircleOutline, WarningOutline, CloseCircleOutline, InfoCircleOutline,
  NotificationOutline, MessageOutline
} from '@ant-design/icons-angular/icons';

const icons: IconDefinition[] = [BellOutline, EditOutline, DeleteOutline, PlusCircleOutline,
  LoginOutline, LogoutOutline, CheckCircleOutline, WarningOutline, CloseCircleOutline,
  InfoCircleOutline, NotificationOutline, MessageOutline];
@NgModule({
  declarations: [
    //pipes
    DatePipe,
    DateWeekPipe,
    DateTimeWeekPipe,
    FromNowPipe,
    TypePipe,
    RangePipe,
    AccountRolesPipe,
    TeacherTeachesPipe,
    ChildTeachersPipe,
    AccountPhonesPipe,
    AccountPhonesArrPipe,

    //components
    AppComponent,
    HomeComponent,
    FieldComponent,
    HeaderComponent,
    LoginComponent,
    FooterComponent,
    ProgramComponent,
    ChildrenComponent,
    MessageDialogComponent,
    AddEditChildComponent,
    PersonFormComponent,
    AddEditFieldComponent,
    SpinnerComponent,
    AddEditProgramComponent,
    ActivityComponent,
    AddEditActivityComponent,
    GoalComponent,
    AddEditGoalComponent,
    SelectActivityComponent,
    AccountComponent,
    AddEditAccountComponent,
    PasswordDialogComponent,
    EvaluationComponent,
    Page404Component,
    SettingsComponent,
    AddEditEvaluationComponent,
    StrengthComponent,
    AddEditStrengthComponent,
    SpecialActivityComponent,
    LoginFormComponent,
    ReportChildComponent,
    ViewChildComponent,
    ChildInfoComponent,
    TitleComponent,
    ViewAccountComponent,
    DashboardComponent,
    SearchExportComponent,
    ControlButtonsComponent,
    HeaderActionsComponent,
    NotificationDrawerComponent,
    NotificationItemComponent,
    SendMessageComponent,
    AboutUsComponent,
    CardComponent,
    TimeframeComponent,
    PersonViewComponent,
    ActivityItemComponent,
    EntityItemComponent,
    NumberCardComponent,
    FileManagerComponent,
    DatepickerComponent,
    AddParentComponent,
    AddEditAccountFormComponent,
    RateItemComponent,
    VerticalTimelineComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    RouterModule,
    BrowserAnimationsModule,
    AppMaterialModule,
    AgGridModule,
    YouTubePlayerModule,
    NgxChartsModule,
    FileManagerModule,
    NgxTimelineModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (http: HttpClient) => new TranslateHttpLoader(http),
        deps: [HttpClient],
      },
    }),
    NzIconModule.forRoot(icons),
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: !isDevMode(),
      // Register the ServiceWorker as soon as the application is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000'
    }),

  ],
  providers: [//pipes are needed in display.service will be added as providers
    FromNowPipe,
    AccountRolesPipe,
    CalcAgePipe,
    ChildTeachersPipe,
    DateTimeWeekPipe,
    DateWeekPipe,
    DatePipe,
    FromNowPipe,
    TeacherTeachesPipe,
    TranslatePipe,
    AccountPhonesPipe,
    AccountPhonesArrPipe,
    TitleCasePipe,
    ToolbarService, DetailsViewService,
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS] },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: WithCredentialsInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpCatchInterceptor,
      multi: true
    }, {
      provide: MAT_DIALOG_DEFAULT_OPTIONS,
      useValue: {
        role: 'dialog',
        enterAnimationDuration: 250,
        exitAnimationDuration: 250,
      } as MatDialogConfig
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
