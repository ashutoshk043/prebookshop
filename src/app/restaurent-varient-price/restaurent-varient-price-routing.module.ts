import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RestaurantVariantPriceComponent } from './restaurent-varient-price/restaurent-varient-price.component';

const routes: Routes = [
  {
    path:'',
    component: RestaurantVariantPriceComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RestaurentVarientPriceRoutingModule { }
