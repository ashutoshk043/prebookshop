import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Apollo } from 'apollo-angular';
import { ToastrService } from 'ngx-toastr';
import { ADD_PRODUCT, UPDATE_PRODUCT } from '../../graphql/productmanagement/product-mutaion';

declare var bootstrap: any;

@Component({
  selector: 'app-product-management-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './product-management-form.component.html'
})
export class ProductManagementFormComponent {

  @Input() categories: any[] = [];
  @Input() selectedProduct: any;
  @Output() close = new EventEmitter<void>();


  productForm!: FormGroup;
  formMode: 'add' | 'edit' = 'add';
  editProductId: string | null = null;
  modalInstance: any;
  previewImage: string | null = null;

  tagOptions = [
    { id: 'BESTSELLER', name: 'Best Seller' },
    { id: 'TRENDING', name: 'Trending' },
    { id: 'NEW', name: 'New' }
  ];

  constructor(
    private fb: FormBuilder,
    private apollo: Apollo,
    private toastr: ToastrService
  ) {
    this.buildForm();
  }

  ngAfterViewInit() {
    const modalEl = document.getElementById('productModal');
    this.modalInstance = new bootstrap.Modal(modalEl);
    this.modalInstance.show();
  }

  buildForm() {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      slug: ['', Validators.required],
      categoryId: ['', Validators.required],
      description: [''],
      imageUrl: [''],
      tags: [[]],
      isVeg: [true],
      isActive: [true],
      isOnlineVisible: [true]
    });
  }

  openFormFromParent(mode: 'add' | 'edit', data?: any) {
    this.formMode = mode;
    this.editProductId = null;
    this.previewImage = null;

    if (mode === 'add') {
      this.productForm.reset({
        tags: [],
        isVeg: true,
        isActive: true,
        isOnlineVisible: true
      });
      return;
    }

    if (mode === 'edit' && data) {
      this.editProductId = data._id;
      this.previewImage = data.imageUrl ?? null;

      this.productForm.reset();
      this.productForm.patchValue({
        name: data.name ?? '',
        slug: data.slug ?? '',
        categoryId: data.categoryId ?? '',
        description: data.description ?? '',
        imageUrl: data.imageUrl ?? '',
        tags: Array.isArray(data.tags) ? data.tags : [],
        isVeg: data.isVeg ?? true,
        isActive: data.isActive ?? true,
        isOnlineVisible: data.isOnlineVisible ?? true
      });
    }

    this.modalInstance.show();
  }

  updateSlug(event: Event) {
    const value = (event.target as HTMLInputElement).value || '';
    const slug = value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

    this.productForm.patchValue({ slug });
  }

  toggleTag(tagId: string, checked: boolean) {
    const currentTags = Array.isArray(this.productForm.value.tags)
      ? [...this.productForm.value.tags]
      : [];

    if (checked) {
      if (!currentTags.includes(tagId)) {
        currentTags.push(tagId);
      }
    } else {
      const index = currentTags.indexOf(tagId);
      if (index > -1) {
        currentTags.splice(index, 1);
      }
    }

    this.productForm.patchValue({ tags: currentTags });
    this.productForm.get('tags')?.markAsDirty();
  }

  submit() {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    const payload = this.productForm.value;

    const mutation =
      this.formMode === 'edit'
        ? this.apollo.mutate({
          mutation: UPDATE_PRODUCT,
          variables: { _id: this.editProductId, input: payload }
        })
        : this.apollo.mutate({
          mutation: ADD_PRODUCT,
          variables: { input: payload }
        });

    mutation.subscribe({
      next: () => {
        this.toastr.success(
          this.formMode === 'edit' ? 'Product Updated' : 'Product Added'
        );
        this.closeModal();
      },
      error: () => this.toastr.error('Operation failed')
    });
  }

  closeModal() {
    this.productForm.reset();
    this.modalInstance.hide();
    this.close.emit();
  }
}