import { Component, EventEmitter, Input, Output, AfterViewInit, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Apollo } from 'apollo-angular';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';

import {
  ADD_PRODUCT_VARIANT,
  UPDATE_PRODUCT_VARIANT
} from '../../graphql/globalproductvarients/product-variant-mutation';
import { GET_PRODUCT_BY_ID, SEARCH_PRODUCTS } from '../../graphql/productmanagement/product-query';

declare var bootstrap: any;

@Component({
  selector: 'app-globalproductvarients-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgSelectModule],
  templateUrl: './globalproductvarients-form.component.html',
  styleUrls: ['./globalproductvarients-form.component.css']
})
export class GlobalproductvarientsFormComponent implements OnInit, AfterViewInit, OnDestroy {

  @Input() productId!: string;
  @Output() close = new EventEmitter<void>();

  productVarientForm!: FormGroup;
  formMode: 'add' | 'edit' = 'add';
  editVariantId: string | null = null;
  modalInstance: any;

  sizeOptions: any = [
  ];

  products: any[] = [];
  currentPage = 1;
  limit = 10;
  totalItems = 0;
  totalPages = 0;
  searchCategory: string | null = null;

  searchSubject = new Subject<string>();
  private searchSub: any;

  constructor(
    private fb: FormBuilder,
    private apollo: Apollo,
    private toastr: ToastrService
  ) { }

  ngOnInit() {
    this.buildForm();

    // Search debounce
    this.searchSub = this.searchSubject
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((term: string) => {
        this.currentPage = 1;
        this.getAllProducts(term);
      });
  }

  ngAfterViewInit() {
    const modalEl = document.getElementById('productVarientModal');
    if (modalEl) {
      this.modalInstance = new bootstrap.Modal(modalEl);
    }
  }

  ngOnDestroy(): void {
    this.searchSub?.unsubscribe();
  }

  buildForm() {
    this.productVarientForm = this.fb.group({
      productId: ['', Validators.required],
      size: ['', Validators.required],
      isActive: [true]
    });
  }

  openFormFromParent(mode: 'add' | 'edit', data?: any) {
    this.formMode = mode;
    this.editVariantId = null;

    if (mode === 'add') {
      this.sizeOptions = [];
      this.productVarientForm.reset({
        productId: '',
        size: '',
        isActive: true
      });
      this.getAllProducts();
      this.modalInstance.show();   // show immediately for add
      return;                      // stop here, no async needed
    }

    if (mode === 'edit' && data) {
      // console.log('Editing variant:', data);
      this.editVariantId = data._id;

      this.apollo
        .query({
          query: GET_PRODUCT_BY_ID,
          variables: {
            _id: data.productId    // ✅ only _id needed, matches query definition
          },
          fetchPolicy: 'no-cache'
        })
        .subscribe({
          next: (res: any) => {
            const product = res.data?.getProductById;  // ✅ correct path from JSON

            // console.log('Fetched product for variant:', product);

            if (product) {
              const mapped = {
                id: product._id,
                name: product.name,
                varients: product.varients   // ["SMALL", "MEDIUM", "LARGE"]
              };

              // inject into products[] so ng-select can display it
              const exists = this.products.some((p) => p.id === mapped.id);
              if (!exists) {
                this.products = [mapped, ...this.products];
              }

              // ✅ build sizeOptions from varients array e.g. ["SMALL","MEDIUM","LARGE"]
              this.sizeOptions = (product.varients || []).map((v: string) => ({
                label: v,
                value: v,
              }));
            } else {
              this.sizeOptions = [];
            }

            // ✅ patch after sizeOptions and products[] are both ready
            this.productVarientForm.patchValue({
              productId: data.productId,
              size: data.size,
              isActive: data.isActive
            });

            this.modalInstance.show();  // ✅ show only after everything ready
          },
          error: () => {
            this.toastr.error('Failed to load product sizes');

            // still patch and open so user isn't stuck
            this.productVarientForm.patchValue({
              productId: data.productId,
              size: data.size,
              isActive: data.isActive
            });

            this.modalInstance.show();
          }
        });
    }
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
            input: {
              _id: this.editVariantId,
              size: payload.size,
              isActive: payload.isActive
            }
          }
        })
        : this.apollo.mutate({
          mutation: ADD_PRODUCT_VARIANT,
          variables: { input: payload }
        });

    mutation$.subscribe({
      next: () => {
        this.toastr.success(
          this.formMode === 'edit' ? 'Variant Updated Successfully' : 'Variant Added Successfully'
        );
        this.closeModal();
      },
      error: (err) => {
        // Extract exact GQL error message
        const gqlErrors = err?.graphQLErrors;
        const networkError = err?.networkError?.error?.errors;

        let message = 'Operation failed';

        if (gqlErrors?.length) {
          message = gqlErrors.map((e: any) => e.message).join('\n');
        } else if (networkError?.length) {
          message = networkError.map((e: any) => e.message).join('\n');
        } else if (err?.message) {
          message = err.message;
        }

        this.toastr.error(message, 'Error', {
          timeOut: 5000,
          enableHtml: true        // allows \n to render as <br> if needed
        });

        console.error('Mutation error:', err);  // full error in console
      }
    });
  }
  closeModal() {
    this.productVarientForm.reset();
    this.modalInstance.hide();
    this.close.emit();
  }

  getAllProducts(searchName: string = ''): void {
    this.apollo
      .query({
        query: SEARCH_PRODUCTS,
        variables: {
          name: searchName || null,
          categoryId: this.searchCategory || null,
          page: this.currentPage,
          limit: this.limit
        },
        fetchPolicy: 'no-cache'
      })
      .subscribe({
        next: (res: any) => {
          const result = res.data?.searchProducts;
          if (result) {
            this.products = res.data?.searchProducts.data.map((p: any) => ({
              id: p._id,
              name: p.name,
              varients: p.varients
            }));
          } else {
            this.products = [];
            this.totalPages = 0;
          }
        },
        error: () => this.toastr.error('Failed to load products')
      });
  }

  onSearch(event: { term: string; items: any[] }) {
    this.searchSubject.next(event.term);
  }

  onProductSelect(event: any) {
    const varients = event.varients;
    this.sizeOptions = [];
    this.sizeOptions = varients.map((v: any) => ({
      label: v,
      value: v,
    }));
  }
}