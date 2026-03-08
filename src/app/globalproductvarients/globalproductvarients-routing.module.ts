import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GlobalproductvarientsComponent } from './globalproductvarients.component';

const routes: Routes = [
  {
    path:'',
    component:GlobalproductvarientsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GlobalproductvarientsRoutingModule { }
