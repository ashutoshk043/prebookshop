import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReportmanagementComponent } from './reportmanagement.component';

const routes: Routes = [
  {
    path:"",
    component:ReportmanagementComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportmanagementRoutingModule { }
