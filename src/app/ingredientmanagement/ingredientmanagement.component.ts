import { Component, ViewChild } from '@angular/core';
import { LayoutsModule } from "../layouts/layouts.module";
import { HeaderComponent } from "../layouts/header/header.component";
import { ImgredientFormComponent } from "../shared/imgredient-form/imgredient-form.component";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ingredientmanagement',
  standalone: true,
  imports: [LayoutsModule, HeaderComponent, ImgredientFormComponent, CommonModule],
  templateUrl: './ingredientmanagement.component.html',
  styleUrl: './ingredientmanagement.component.css'
})
export class IngredientmanagementComponent {

  showForm: boolean = false;
  @ViewChild(ImgredientFormComponent)
  child!: ImgredientFormComponent;
  formMode: 'add' | 'edit' = 'add';

  openIngredientForm(mode: 'add' | 'edit', restaurantData?: any) {
    this.showForm = true;
    setTimeout(() => {
      if (this.child) {
        this.child.openFormFromParent(mode, restaurantData);
      }
    });
  }

  closeIngredientForm() {
    this.showForm = false;
  }
}
