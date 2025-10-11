import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OrdermanagementRoutingModule } from './ordermanagement-routing.module';
import { OrdermanagementComponent } from './ordermanagement.component';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    OrdermanagementRoutingModule,
    OrdermanagementComponent
  ],
  exports:[OrdermanagementComponent]
})
export class OrdermanagementModule { }
