import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CategorymanagementRoutingModule } from './categorymanagement-routing.module';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    CategorymanagementRoutingModule
  ]
})
export class CategorymanagementModule { 


  showCategoryForm = false;
  formMode: 'add' | 'edit' = 'add';

  openCategoryForm(mode: 'add' | 'edit') {
    this.formMode = mode;
    this.showCategoryForm = true;
  }

  closeCategoryForm() {
    this.showCategoryForm = false;
  }
}
