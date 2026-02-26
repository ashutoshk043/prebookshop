import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-imgredient-form',
  standalone: true,
  imports: [],
  templateUrl: './imgredient-form.component.html',
  styleUrl: './imgredient-form.component.css'
})
export class ImgredientFormComponent {

    @Output() close = new EventEmitter<void>();

    openFormFromParent(mode: 'add' | 'edit', data?: any) {
    console.log("Form Opened:", mode, data);
  }


  
    closeModal() {
      this.close.emit();
    }
}
