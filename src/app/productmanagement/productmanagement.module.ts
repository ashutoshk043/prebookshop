import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProductmanagementRoutingModule } from './productmanagement-routing.module';
import { ProductmanagementComponent } from './productmanagement.component';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    ProductmanagementRoutingModule,
    ProductmanagementComponent
  ],
  exports:[ProductmanagementComponent]
})
export class ProductmanagementModule { }
