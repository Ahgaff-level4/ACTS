import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClient, HttpClientModule } from '@angular/common/http';
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
import { ChildGoalsComponent } from './components/pages/children/child-goals/child-goals.component';
import { PersonFormComponent } from './components/forms/person-form/person-form.component';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { AddEditFieldComponent } from './components/dialogs/add-edit-field/add-edit-field.component';
import { SpinnerComponent } from './components/static/spinner/spinner.component';
import { AddEditProgramComponent } from './components/dialogs/add-edit-program/add-edit-program.component';
import { ActivityComponent } from './components/pages/activity/activity.component';
import { AddEditActivityComponent } from './components/dialogs/add-edit-activity/add-edit-activity.component';
// import { AddEditChildComponent } from './components/dialogs/delete me/add-edit-child.component';
// Factory function required during AOT compilation

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
    AddEditChildComponent,
    ChildGoalsComponent,
    PersonFormComponent,
    AddEditFieldComponent,
    SpinnerComponent,
    AddEditProgramComponent,
    ActivityComponent,
    AddEditActivityComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    // RouterModule,
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
    TranslatePipe
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
