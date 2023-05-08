import { NgModule } from '@angular/core';
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

import { AppComponent } from './components/static/app/app.component';
import { MainComponent } from './components/pages/main/main.component';
import { FieldComponent } from './components/pages/field/field.component';
import { NavBarComponent } from './components/static/nav-bar/nav-bar.component';
import { LoginComponent } from './components/pages/login/login.component';
import { FooterComponent } from './components/static/footer/footer.component';
import { ProgramComponent } from './components/pages/program/program.component';
import { ChildrenComponent } from './components/pages/children/children/children.component';
import { MessageDialogComponent } from './components/dialogs/message/message.component';
import { AddEditChildComponent } from './components/pages/children/add-edit-child/add-edit-child.component';
import { DatePipe } from './pipes/date.pipe';
import { DateTimeWeekPipe } from './pipes/date-time-week.pipe';
import { FromNowPipe } from './pipes/from-now.pipe';
import { PersonFormComponent } from './components/forms/person-form/person-form.component';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { AddEditFieldComponent } from './components/dialogs/add-edit-field/add-edit-field.component';
import { SpinnerComponent } from './components/static/spinner/spinner.component';
import { AddEditProgramComponent } from './components/dialogs/add-edit-program/add-edit-program.component';
import { ActivityComponent } from './components/pages/activity/activity.component';
import { AddEditActivityComponent } from './components/dialogs/add-edit-activity/add-edit-activity.component';
import { TypePipe } from './pipes/type.pipe';
import { RangePipe } from './pipes/range.pipe';
import { GoalComponent } from './components/pages/goal/goal.component';
import { AddEditGoalComponent } from './components/dialogs/add-edit-goal/add-edit-goal.component';
import { SelectActivityComponent } from './components/dialogs/select-activity/select-activity.component';
import { AccountComponent } from './components/pages/accounts/account/account.component';
import { AddEditAccountComponent } from './components/pages/accounts/add-edit-account/add-edit-account.component';
import { ResetChangePasswordComponent } from './components/dialogs/reset-change-password/reset-change-password.component';
import { EvaluationComponent } from './components/pages/evaluation/evaluation.component';
import { Page404Component } from './components/pages/404/404.component';
import { SettingsComponent } from './components/pages/settings/settings.component';
import { AddEditEvaluationComponent } from './components/dialogs/add-edit-evaluation/add-edit-evaluation.component';
import { StrengthComponent } from './components/pages/strength/strength.component';
import { AddEditStrengthComponent } from './components/dialogs/add-edit-strength/add-edit-strength.component';
import { WithCredentialsInterceptor } from './interceptors/WithCredentials.interceptor';

@NgModule({
  declarations: [
    AppComponent,
    MainComponent,
    FieldComponent,
    NavBarComponent,
    LoginComponent,
    FooterComponent,
    ProgramComponent,
    ChildrenComponent,
    MessageDialogComponent,
    DatePipe,
    DateTimeWeekPipe,
    FromNowPipe,
    TypePipe,
    RangePipe,
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
    ResetChangePasswordComponent,
    EvaluationComponent,
    Page404Component,
    SettingsComponent,
    AddEditEvaluationComponent,
    StrengthComponent,
    AddEditStrengthComponent
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
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (http:HttpClient)=>new TranslateHttpLoader(http),
        deps: [HttpClient],
      },
    })
  ],
  providers:[
    TranslatePipe,
    {provide:DateAdapter,useClass:MomentDateAdapter,deps:[MAT_DATE_LOCALE,MAT_MOMENT_DATE_ADAPTER_OPTIONS]},
    {
      provide: HTTP_INTERCEPTORS,
      useClass: WithCredentialsInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
