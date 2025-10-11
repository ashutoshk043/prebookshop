import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OrdermanagementComponent } from './ordermanagement.component';

const routes: Routes = [
  { path: '', component: OrdermanagementComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OrdermanagementRoutingModule { }
