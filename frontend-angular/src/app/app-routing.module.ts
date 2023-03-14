import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainComponent } from './components/pages/main/main.component';
import { FieldComponent } from './components/pages/field/field.component';
import { LoginComponent } from './components/pages/login/login.component';
import { ProgramComponent } from './components/pages/program/program.component';
import { ChildrenComponent } from './components/pages/children/children.component';

const titlePrefix = 'ACTS - ';
const routes: Routes = [
  { path: '', component: MainComponent, title: titlePrefix + 'Home', },
  { path: 'main', component: MainComponent, title: titlePrefix + 'Home' },
  { path: 'home', component: MainComponent, title: titlePrefix + 'Home' },
  { path: 'field', component: FieldComponent, title: titlePrefix + 'Field' },
  { path: 'login', component: LoginComponent, title: titlePrefix + 'Login' },
  { path: 'program', component: ProgramComponent, title: titlePrefix + 'Program' },
  { path: 'children', component: ChildrenComponent, title: titlePrefix + 'Children' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
