import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CategorymanagementComponent } from './categorymanagement.component';

const routes: Routes = [
  {
    path:'',
    component:CategorymanagementComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CategorymanagementRoutingModule { }
 