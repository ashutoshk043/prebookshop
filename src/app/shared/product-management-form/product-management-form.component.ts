import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, OnInit, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Apollo } from 'apollo-angular';
import { ToastrService } from 'ngx-toastr';
import { ADD_PRODUCT, UPDATE_PRODUCT } from '../../graphql/productmanagement/product-mutaion';

declare var bootstrap: any;

@Component({
  selector: 'app-product-management-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './product-management-form.component.html',
  styleUrl: './product-management-form.component.css'
})
export class ProductManagementFormComponent implements OnInit, AfterViewInit {

  @Input() categories: any[] = [];
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

  ngOnInit() {
    console.log('Form initialized');
  }

  ngAfterViewInit() {
    const modalEl = document.getElementById('productModal');
    if (modalEl) {
      this.modalInstance = new bootstrap.Modal(modalEl);
    }

    this.productForm.get('imageUrl')?.valueChanges.subscribe(url => {
      this.previewImage = url;
    });
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
        isOnlineVisible: true,
        categoryId: ''
      });

      this.modalInstance.show();
      return;
    }

    if (mode === 'edit' && data) {

      this.editProductId = data._id;
      this.previewImage = data.imageUrl ?? null;

      const categoryId = data.categoryId || data.category?.id || '';

      // agar categories empty hai to edit wali category add kar do
      if (categoryId && !this.categories.find(c => c._id === categoryId)) {
        this.categories = [
          ...this.categories,
          {
            _id: categoryId,
            name: data.category?.name || 'Unknown'
          }
        ];
      }

      this.productForm.patchValue({
        name: data.name || '',
        slug: data.slug || '',
        categoryId: categoryId,
        description: data.description || '',
        imageUrl: data.imageUrl || '',
        tags: Array.isArray(data.tags) ? [...data.tags] : [],
        isVeg: data.isVeg ?? true,
        isActive: data.isActive ?? true,
        isOnlineVisible: data.isOnlineVisible ?? true
      });

      this.modalInstance.show();
    }
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

  toggleTag(tagId: string, event: Event) {

    const input = event.target as HTMLInputElement;
    const checked = input.checked;

    const currentTags = [...(this.productForm.value.tags || [])];

    if (checked) {
      if (!currentTags.includes(tagId)) {
        currentTags.push(tagId);
      }
    } else {
      const index = currentTags.indexOf(tagId);
      if (index > -1) currentTags.splice(index, 1);
    }

    this.productForm.patchValue({ tags: currentTags });
  }

  submit() {

    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      this.toastr.warning('Please fill required fields');
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
          this.formMode === 'edit'
            ? 'Product Updated!'
            : 'Product Added!'
        );

        this.closeModal();
      },
      error: (err) => {
        console.error(err);
        this.toastr.error('Operation failed');
      }
    });
  }

  closeModal() {
    this.productForm.reset();
    this.modalInstance.hide();
    this.close.emit();
  }

  trackById(index: number, item: any) {
    return item._id;
  }

}