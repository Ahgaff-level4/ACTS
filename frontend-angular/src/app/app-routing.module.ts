import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainComponent } from './components/pages/main/main.component';
import { FieldComponent } from './components/pages/field/field.component';
import { LoginComponent } from './components/pages/login/login.component';

const routes: Routes = [
  { path: '', component: MainComponent,title:'ACTS - Home', },
  { path: 'main', component: MainComponent,title:'ACTS - Home' },
  { path: 'home', component: MainComponent,title:'ACTS - Home' },
  { path: 'field', component: FieldComponent,title:'ACTS - Field' },
  { path: 'login', component: LoginComponent,title:'ACTS - Login' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
