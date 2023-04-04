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
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';

import { AppComponent } from './components/app/app.component';
import { MainComponent } from './components/pages/main/main.component';
import { FieldComponent } from './components/pages/field/field.component';
import { NavBarComponent } from './components/nav-bar/nav-bar.component';
import { LoginComponent } from './components/pages/login/login.component';
import { FooterComponent } from './components/footer/footer.component';
import { ProgramComponent } from './components/pages/program/program.component';
import { ChildrenComponent } from './components/pages/children/children.component';
import { MessageDialogComponent } from './components/dialogs/message/message.component';
import { AddChildComponent } from './components/pages/add-child/add-child.component';
import { DatePipe } from './pipes/date.pipe';
import { DateTimeWeekPipe } from './pipes/date-time-week.pipe';
import { FromNowPipe } from './pipes/from-now.pipe';
import { AddEditChildComponent } from './components/dialogs/add-edit-child/add-edit-child.component';
// Factory function required during AOT compilation
export function httpTranslateLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}

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
    AddChildComponent,
    DatePipe,
    DateTimeWeekPipe,
    FromNowPipe,
    AddEditChildComponent
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
        useFactory: httpTranslateLoaderFactory,
        deps: [HttpClient]
      }
    })
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
