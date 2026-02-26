import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IngredientmanagementComponent } from './ingredientmanagement.component';

const routes: Routes = [
{
  path:'',
  component:IngredientmanagementComponent
}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class IngredientmanagementRoutingModule { }
