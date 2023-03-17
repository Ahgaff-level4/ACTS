import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainComponent } from './components/pages/main/main.component';
import { FieldComponent } from './components/pages/field/field.component';
import { LoginComponent } from './components/pages/login/login.component';
import { ProgramComponent } from './components/pages/program/program.component';
import { ChildrenComponent } from './components/pages/children/children.component';
import { AddChildComponent } from './components/pages/add-child/add-child.component';
import { AdminGuard } from './guards/admin.guard';
import { HeadOfDepartmentGuard } from './guards/head-of-department.guard';
import { TeacherGuard } from './guards/teacher.guard';
import { ParentGuard } from './guards/parent.guard';

const titlePrefix = 'ACTS - ';
const allActors = [AdminGuard, HeadOfDepartmentGuard, TeacherGuard, ParentGuard];
const AH = [AdminGuard,HeadOfDepartmentGuard];
const AHT = [AdminGuard,HeadOfDepartmentGuard,TeacherGuard];

const routes: Routes = [
  { path: '', component: MainComponent, title: titlePrefix + 'Home', },
  { path: 'main', component: MainComponent, title: titlePrefix + 'Home' },
  { path: 'home', component: MainComponent, title: titlePrefix + 'Home' },
  { path: 'login', component: LoginComponent, title: titlePrefix + 'Login' },
  { path: 'field', component: FieldComponent, title: titlePrefix + 'Field', canActivate: AHT },
  { path: 'program', component: ProgramComponent, title: titlePrefix + 'Program', canActivate: AHT },
  { path: 'children', component: ChildrenComponent, title: titlePrefix + 'Children', canActivate: allActors },
  { path: 'add-child', component: AddChildComponent, title: titlePrefix + 'Add Child',canActivate:AH }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
