import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ManageRestraurentComponent } from './manage-restraurent.component';

const routes: Routes = [
  {
    path:'',
    component:ManageRestraurentComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ManageRestraurentRoutingModule { }
