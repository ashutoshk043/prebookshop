import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedRoutingModule } from './shared-routing.module';
import { CreateUserFormComponent } from './create-user-form/create-user-form.component';
import { CreateDeliveryPartnerFormComponent } from './create-delivery-partner-form/create-delivery-partner-form.component';
import { CreateRestraurentFormComponent } from './create-restraurent-form/create-restraurent-form.component';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    SharedRoutingModule,
    CreateUserFormComponent,
    CreateDeliveryPartnerFormComponent,CreateRestraurentFormComponent
  ],
  exports:[CreateUserFormComponent,CreateDeliveryPartnerFormComponent,CreateRestraurentFormComponent]
})
export class SharedModule { }
