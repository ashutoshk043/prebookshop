import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ADD_INGREDIENT, UPDATE_INGREDIENT } from '../../graphql/ingredientmanagement/ingredientmanagement.mutation';
import { Apollo } from 'apollo-angular';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-imgredient-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './imgredient-form.component.html',
  styleUrl: './imgredient-form.component.css'
})
export class ImgredientFormComponent {

  @Output() close = new EventEmitter<void>();

  ingredientForm!: FormGroup;
  mode: 'add' | 'edit' = 'add';
  ingredientId: string | null = null;

  constructor(private fb: FormBuilder,
  private apollo: Apollo, private toastr: ToastrService) {

  }

  ngOnInit() {
    this.createForm();  
  }

  createForm() {
    this.ingredientForm = this.fb.group({
      name: ['', Validators.required],
      unit: ['', Validators.required]
    });
  }

  openFormFromParent(mode: 'add' | 'edit', data?: any) {

    this.mode = mode;

    if (mode === 'edit' && data) {

    this.ingredientId = data._id;

    this.ingredientForm.patchValue({
      name: data.name,
      unit: data.unit
    });

  }

    console.log("Form Opened:", mode, data);
  }

submitForm() {
  if (this.ingredientForm.invalid) {
    this.ingredientForm.markAllAsTouched();
    return;
  }

  const input = { ...this.ingredientForm.value };

if (this.mode === 'add') {
  this.apollo.mutate({
    mutation: ADD_INGREDIENT,
    variables: { input }
  }).subscribe({
    next: (res: any) => {
      this.toastr.success('Ingredient added successfully');
      this.closeModal();
    },
    error: (err) => {
      // ✅ Backend ka exact error message dikhao
      const msg = err?.message || 'Failed to add ingredient';
      this.toastr.error(msg);
    }
  });
} else {

    const updateInput = {
      id: this.ingredientId,
      ...this.ingredientForm.value
    };

    this.apollo.mutate({
      mutation: UPDATE_INGREDIENT,
      variables: { input: updateInput }
    }).subscribe({
      next: (res: any) => {
        this.toastr.success('Ingredient updated successfully'); // ✅
        this.closeModal();
      },
      error: (err) => {
        console.error('Update Error', err);
        this.toastr.error('Failed to update ingredient');       // ✅
      }
    });

  }
}

  closeModal() {
    this.close.emit();
  }

}