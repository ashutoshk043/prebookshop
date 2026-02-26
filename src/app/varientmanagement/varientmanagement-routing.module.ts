import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VarientmanagementComponent } from './varientmanagement.component';

const routes: Routes = [
  {
    path:'',
    component:VarientmanagementComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VarientmanagementRoutingModule { }
