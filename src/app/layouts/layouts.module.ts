import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LayoutsRoutingModule } from './layouts-routing.module';
import { SidebarComponent } from './sidebar/sidebar.component';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    LayoutsRoutingModule,
    SidebarComponent
  ],
  exports:[SidebarComponent]
})
export class LayoutsModule { }
