import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedRoutingModule } from './shared-routing.module';
import { CreateUserFormComponent } from './create-user-form/create-user-form.component';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    SharedRoutingModule,
    CreateUserFormComponent
  ],
  exports:[CreateUserFormComponent]
})
export class SharedModule { }
