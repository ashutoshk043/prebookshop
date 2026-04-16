import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, OnInit, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Apollo } from 'apollo-angular';
import { ToastrService } from 'ngx-toastr';
import { NgSelectModule } from '@ng-select/ng-select';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';

import { ADD_PRODUCT, UPDATE_PRODUCT } from '../../graphql/productmanagement/product-mutaion';
import { GET_ALL_CATEGORIES_FORM } from '../../graphql/categoryManagement/query';

declare var bootstrap: any;

@Component({
  selector: 'app-product-management-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgSelectModule],
  templateUrl: './product-management-form.component.html',
  styleUrls: ['./product-management-form.component.css']
})
export class ProductManagementFormComponent implements OnInit, AfterViewInit {

  @Output() close = new EventEmitter<void>();

  productForm!: FormGroup;

  categories: any[] = [];
  previewImage: string | null = null;

  formMode: 'add' | 'edit' = 'add';
  editProductId: string | null = null;

  modalInstance: any;

  private searchSubject = new Subject<string>();
  private lastSearch = '';

  /* ---------------- VARIANTS ---------------- */

  sizes = [
    { id: 'SMALL', name: 'Small' },
    { id: 'REGULAR', name: 'Regular' },
    { id: 'LARGE', name: 'Large' },
    { id: 'EXTRA_LARGE', name: 'Extra Large' },

    { id: 'QUARTER', name: 'Quarter' },
    { id: 'HALF', name: 'Half' },
    { id: 'FULL', name: 'Full' },
    { id: 'FAMILY_PACK', name: 'Family Pack' },

    { id: 'SINGLE', name: 'Single' },
    { id: 'DOUBLE', name: 'Double' },

    { id: '100G', name: '100g' },
    { id: '250G', name: '250g' },
    { id: '500G', name: '500g' },
    { id: '750G', name: '750g' },
    { id: '1KG', name: '1kg' },
    { id: '2KG', name: '2kg' },

    { id: '250ML', name: '250ml' },
    { id: '330ML', name: '330ml' },
    { id: '500ML', name: '500ml' },
    { id: '750ML', name: '750ml' },

    { id: '1L', name: '1L' },
    { id: '2L', name: '2L' },

    { id: 'SCOOP', name: 'Scoop' },
    { id: 'ONE_CUP', name: '1 Cup' },
    { id: 'TWO_CUPS', name: '2 Cups' },
    { id: 'TUB_500ML', name: '500ml Tub' },

    { id: '6_INCH', name: '6 Inch' },
    { id: '9_INCH', name: '9 Inch' },
    { id: '12_INCH', name: '12 Inch' },

    { id: 'BOWL', name: 'Bowl' },
    { id: 'LARGE_BOWL', name: 'Large Bowl' },
    { id: 'TAKEAWAY', name: 'Takeaway' },

    { id: 'CAN', name: 'Can' },
    { id: 'BOTTLE', name: 'Bottle' },
    { id: 'LARGE_BOTTLE', name: 'Large Bottle' },

    { id: 'ESPRESSO', name: 'Espresso' },
    { id: 'CAPPUCCINO', name: 'Cappuccino' },
    { id: 'LATTE', name: 'Latte' },
    { id: 'MOCHA', name: 'Mocha' }
  ];

  constructor(
    private fb: FormBuilder,
    private apollo: Apollo,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {

    this.buildForm();
    this.getIncludedCategoriesPaginated();

    this.searchSubject
      .pipe(
        debounceTime(500),
        distinctUntilChanged()
      )
      .subscribe(search => {
        this.getIncludedCategoriesPaginated(1, 10, search);
      });
  }

  ngAfterViewInit(): void {

    const modalEl = document.getElementById('productModal');

    if (modalEl) {
      this.modalInstance = new bootstrap.Modal(modalEl);
    }

    this.productForm.get('imageUrl')?.valueChanges.subscribe(url => {
      this.previewImage = url || null;
    });
  }

  buildForm() {

    this.productForm = this.fb.group({
      name: ['', Validators.required],
      slug: ['', Validators.required],
      categoryId: [null, Validators.required],
      description: [''],
      imageUrl: [''],
      varients: [[], Validators.required],
      isVeg: [true],
      isActive: [true],
      isOnlineVisible: [true]
    });

  }

  /* ---------------- OPEN FORM ---------------- */

  openFormFromParent(mode: 'add' | 'edit', data?: any) {

    const modalEl = document.getElementById('productModal');

    if (!this.modalInstance && modalEl) {
      this.modalInstance = new bootstrap.Modal(modalEl);
    }

    this.formMode = mode;

    if (mode === 'add') {

      this.editProductId = null;

      this.productForm.reset({
        name: '',
        slug: '',
        categoryId: null,
        description: '',
        imageUrl: '',
        varients: [],
        isVeg: true,
        isActive: true,
        isOnlineVisible: true
      });

      this.previewImage = null;
      this.modalInstance.show();
      return;
    }

    if (mode === 'edit' && data) {

      console.log(data, "edit isisisiis")

      const categoryId = data.category?.id || '';

      if (categoryId && !this.categories.find(c => c._id === categoryId)) {
        this.categories = [
          ...this.categories,
          {
            _id: categoryId,
            name: data.category?.name || 'Unknown'
          }
        ];
      }

      this.editProductId = data._id;

      this.productForm.patchValue({
        ...data,
        categoryId: categoryId,
        varients: data.varients || []
      });

      this.previewImage = data.imageUrl;
      this.modalInstance.show();
    }
  }

  /* ---------------- SLUG ---------------- */

  updateSlug(event: Event) {

    const value = (event.target as HTMLInputElement).value;

    const slug = value
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-');

    this.productForm.patchValue({ slug });
  }

  /* ---------------- VARIANT TOGGLE ---------------- */

  toggleVariant(id: string) {
    const control = this.productForm.get('varients');
    const current: string[] = control?.value || [];

    let updated: string[];

    if (current.includes(id)) {
      updated = current.filter(v => v !== id);
    } else {
      updated = [...current, id]; // ✅ NEW ARRAY
    }

    control?.setValue(updated);
    control?.markAsDirty();
  }

  /* ---------------- SUBMIT ---------------- */

  submit() {

    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      this.toastr.warning('Please fill required fields');
      return;
    }

    const payload = {
      ...this.productForm.value,
      varients: this.productForm.value.varients || []
    };

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
            ? 'Product Updated'
            : 'Product Added'
        );

        this.closeModal();

      },
      error: () => {
        this.toastr.error('Operation failed');
      }
    });

  }

  closeModal() {

    this.productForm.reset();
    this.previewImage = null;

    if (this.modalInstance) {
      this.modalInstance.hide();
    }

    this.close.emit();
  }

  /* ---------------- CATEGORY SEARCH ---------------- */

  getIncludedCategoriesPaginated(page = 1, limit = 10, search = '') {

    this.apollo.query<any>({
      query: GET_ALL_CATEGORIES_FORM,
      variables: { page, limit, search: search || null },
      fetchPolicy: 'network-only'
    })
      .subscribe(res => {

        const result = res.data?.includedCategoriesPaginated;
        this.categories = result?.data || [];

      });

  }

  onSearch(event: any) {

    const term = event.term || '';

    if (term === this.lastSearch) return;

    this.lastSearch = term;

    this.searchSubject.next(term);
  }

}