import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ManageDeliveryPartnersComponent } from './manage-delivery-partners.component';

const routes: Routes = [
  {
      path:'',
      component:ManageDeliveryPartnersComponent
    }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ManageDeliveryPartnersRoutingModule { }
