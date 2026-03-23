import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RestaurantIngredientsStockComponent } from './restaurant-ingredients-stock/restaurant-ingredients-stock.component';

const routes: Routes = [
  {
    path:'',
    component:RestaurantIngredientsStockComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RestaurantIngredientsStockRoutingModule { }
