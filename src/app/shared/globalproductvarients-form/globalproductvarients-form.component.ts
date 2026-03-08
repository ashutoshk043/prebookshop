import { Component, EventEmitter, Input, Output, AfterViewInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Apollo } from 'apollo-angular';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';

import {
  ADD_PRODUCT_VARIANT,
  UPDATE_PRODUCT_VARIANT
} from '../../graphql/globalproductvarients/product-variant-mutation';

declare var bootstrap: any;

@Component({
  selector: 'app-globalproductvarients-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './globalproductvarients-form.component.html',
  styleUrl: './globalproductvarients-form.component.css'
})
export class GlobalproductvarientsFormComponent implements AfterViewInit {

  @Input() productId!: string;
  @Output() close = new EventEmitter<void>();

  productVarientForm!: FormGroup;
  formMode: 'add' | 'edit' = 'add';
  editVariantId: string | null = null;
  modalInstance: any;

  // SIZE OPTIONS
  sizeOptions = [
    { label: 'Small', value: 'SMALL' },
    { label: 'Regular', value: 'REGULAR' },
    { label: 'Large', value: 'LARGE' }
  ];

  products = [
    { id: '699f4085c3346372db720193', name: 'Biriyani' },
    { id: '699f3b619653890bccc9a468', name: 'Veg Burger' }
  ];

  constructor(
    private fb: FormBuilder,
    private apollo: Apollo,
    private toastr: ToastrService
  ) {
    this.buildForm();
  }

  ngAfterViewInit() {
    const modalEl = document.getElementById('productVarientModal');
    this.modalInstance = new bootstrap.Modal(modalEl);
  }

  // ✅ FINAL FORM (ONLY REQUIRED FIELDS)
  buildForm() {
    this.productVarientForm = this.fb.group({
      productId: [''],
      size: ['REGULAR'],
      isActive: [true]
    });
  }

  // OPEN MODAL
  openFormFromParent(mode: 'add' | 'edit', data?: any) {
    this.formMode = mode;
    this.editVariantId = null;

    if (mode === 'add') {
      this.productVarientForm.reset({
        productId: this.productId,
        size: '',
        isActive: true
      });
    }

    if (mode === 'edit' && data) {
      this.editVariantId = data._id;
      this.productVarientForm.patchValue({
        productId: data.productId,
        size: data.size,
        isActive: data.isActive
      });
    }

    this.modalInstance.show();
  }

  submit() {
    if (this.productVarientForm.invalid) {
      this.productVarientForm.markAllAsTouched();
      return;
    }

    const payload = this.productVarientForm.value;

    const mutation$ =
      this.formMode === 'edit'
        ? this.apollo.mutate({
          mutation: UPDATE_PRODUCT_VARIANT,
          variables: {
            _id: this.editVariantId,
            input: payload
          }
        })
        : this.apollo.mutate({
          mutation: ADD_PRODUCT_VARIANT,
          variables: {
            input: payload
          }
        });

    mutation$.subscribe({
      next: () => {
        this.toastr.success(
          this.formMode === 'edit'
            ? 'Variant Updated Successfully'
            : 'Variant Added Successfully'
        );
        this.closeModal();
      },
      error: () => this.toastr.error('Operation failed')
    });
  }

  closeModal() {
    this.productVarientForm.reset();
    this.modalInstance.hide();
    this.close.emit();
  }
}