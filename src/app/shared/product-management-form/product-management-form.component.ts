import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
declare var bootstrap: any;
import { ADD_PRODUCT, UPDATE_PRODUCT } from '../../graphql/productmanagement/product-mutaion';
import { Apollo } from 'apollo-angular';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-product-management-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './product-management-form.component.html',
  styleUrl: './product-management-form.component.css'
})
export class ProductManagementFormComponent {

  @Input() isEditMode = false;
  @Input() selectedProduct: any;
  formMode: 'add' | 'edit' = 'add';
  @Output() close = new EventEmitter<void>();
  modalInstance: any;
  productForm!: FormGroup;
  previewImage: any = null
  editProductId: any


  constructor(private fb: FormBuilder, private apollo: Apollo, private toster: ToastrService) { }

  ngOnInit(): void {
    this.buildForm();
  }

  ngAfterViewInit() {
    const modalEl = document.getElementById('productModal');
    this.modalInstance = new bootstrap.Modal(modalEl);
    this.modalInstance.show(); // 🔥 auto open
  }

  private buildForm() {
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      restaurantName: ['', Validators.required],
      category: ['', Validators.required],
      variant: ['', Validators.required],
      price: [null, [Validators.required, Validators.min(1)]],
      stock: [0, [Validators.required, Validators.min(0)]],

      // 🔹 Optional
      description: [''],
      imageUrl: ['']
    });
  }

  openFormFromParent(mode: 'add' | 'edit', data?: any) {
    this.productForm.reset();
    this.formMode = mode;

    if (mode === 'edit' && data) {

      this.productForm.patchValue({
        name: data.name,
        restaurantName: data.restaurantName ?? '', // agar backend se aa raha ho
        category: data.category,
        variant: data.variant,
        price: data.price,
        stock: data.stock,
        description: data.description,
        imageUrl: data.imageUrl // ✅ base64 ya normal URL
      });
      this.editProductId = data._id

      // agar image preview chahiye
      this.previewImage = data.imageUrl;
    }

    this.modalInstance?.show();
  }

  onImageUrlChange(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.previewImage = value?.trim() ? value : null;
  }

  closeModal() {
    this.modalInstance.hide();
    this.close.emit();
  }

  submit() {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    this.apollo.mutate({
      mutation: ADD_PRODUCT,
      variables: {
        input: this.productForm.value
      }
    }).subscribe({
      next: (res: any) => {
        // console.log('Product Added:', res.data.addProducts);
        this.toster.success('Product Added')
        this.productForm.reset();
        this.closeModal()
      },
      error: (err: any) => {
        this.toster.error('Error adding product')
        // console.error('Error adding product:', err);
      }
    });
  }


  updateProduct() {

    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }
    this.apollo.mutate({
      mutation: UPDATE_PRODUCT,
      variables: {
        _id: this.editProductId,
        input: this.productForm.value
      }
    }).subscribe({
      next: (res: any) => {
        this.toster.success('Product Updated')
        this.productForm.reset();
        this.closeModal()
      },
      error: (err: any) => {
        this.toster.error(err)
      }
    });
  }


}
