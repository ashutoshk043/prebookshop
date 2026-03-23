import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CouponsComponent } from '../coupons/coupons/coupons.component';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('../coupons/coupons/coupons.component').then(m => m.CouponsComponent)
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CouponsRoutingModule { }
