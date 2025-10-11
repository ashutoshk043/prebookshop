import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProductmanagementComponent } from './productmanagement.component';

const routes: Routes = [
  { path: '', component: ProductmanagementComponent }
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProductmanagementRoutingModule { }
