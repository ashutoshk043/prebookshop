import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { RestraurentProfileComponent } from '../restraurent-profile/restraurent-profile.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'restraurent-login',
    pathMatch: 'full'
  },
  {
    path: 'restraurent-login',
    component: LoginComponent
  },
  {
    path: 'register',
    component: RegisterComponent
  },
  {
    path: 'restaurent-profile',
    component:RestraurentProfileComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }
