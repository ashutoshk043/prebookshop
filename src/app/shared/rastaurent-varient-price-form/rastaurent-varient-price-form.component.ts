import { Component, EventEmitter, OnInit, OnDestroy, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { Apollo } from 'apollo-angular';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

import {
  CREATE_RESTAURANT_VARIANT_PRICE,
  UPDATE_RESTAURANT_VARIANT_PRICE,
} from '../../graphql/restaurant-variant-price/mutation';
import { GET_PRODUCT_VARIANTS } from '../../graphql/globalproductvarients/product-variant-query';
import { GET_RESTAURANTS } from '../../graphql/restraurentmanagement/restraurent-query';

@Component({
  selector: 'app-rastaurent-varient-price-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgSelectModule],
  templateUrl: './rastaurent-varient-price-form.component.html',
  styleUrl: './rastaurent-varient-price-form.component.css'
})
export class RestaurantVariantPriceFormComponent implements OnInit, OnDestroy {

  @Output() close = new EventEmitter<void>();

  mode: 'add' | 'edit' = 'add';
  isSubmitting = false;
  editId = '';

  // ── Restaurants ──────────────────────────────────────────
  restaurants: any[]        = [];
  isLoadingRestaurants      = false;
  private restaurantPage    = 1;
  private restaurantLimit   = 10;
  private restaurantSearch  = '';
  private restaurantDone    = false;
  private restaurantSearchSubject = new Subject<string>();

  // ── Variants ─────────────────────────────────────────────
  productVarients: any[]  = [];
  isLoadingVariants       = false;
  private variantPage     = 1;
  private variantLimit    = 10;
  private variantSearch   = '';
  private variantDone     = false;
  private variantSearchSubject = new Subject<string>();

  // ── Form ─────────────────────────────────────────────────
  priceForm!: FormGroup;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private apollo: Apollo,
    private toastr: ToastrService,
  ) {}

  ngOnInit() {
    this.buildForm();

    this.restaurantSearchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      takeUntil(this.destroy$),
    ).subscribe(term => {
      this.restaurantSearch = term;
      this.loadRestaurants(true);
    });

    this.variantSearchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      takeUntil(this.destroy$),
    ).subscribe(term => {
      this.variantSearch = term;
      this.loadVariants(true);
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

buildForm() {
  this.priceForm = this.fb.group({
    restaurantId:       ['',   Validators.required],
    variantId:          ['',   Validators.required],
    price:              [null, [Validators.required, Validators.min(1)]],
    mrp:                [null, [Validators.required, Validators.min(1)]],  // ✅
    // actualSellingPrice: [null, [Validators.required, Validators.min(1)]],  // ✅
    isAvailable:        [true],
  });
}

  // ── Called from parent via @ViewChild ────────────────────
  openFormFromParent(mode: 'add' | 'edit', data?: any) {
    this.mode = mode;
    this.priceForm.reset({ isAvailable: true });

    if (mode === 'edit' && data) {
      this.editId = data._id;

      // ── Step 1: extract IDs from nested objects ──────────
      const restaurantId = data.restaurant?._id?.toString();
      const variantId    = data.variant?._id?.toString();

      // ── Step 2: pre-seed dropdowns with the selected items
      // so ng-select shows the label immediately without waiting
      // for the full list to load
      this.restaurants = [{
        id:             restaurantId,
        restaurantName: data.restaurant?.name || '',
      }];

      this.productVarients = [{
        _id:     variantId,
        size:    data.variant?.name || '',
        product: { name: data.product?.name || '' },
        isActive: true,
      }];

      // ── Step 3: patch form with extracted IDs ────────────
this.priceForm.patchValue({
  restaurantId:       restaurantId,
  variantId:          variantId,
  price:              data.price,
  mrp:                data.mrp,                 // ✅
  // actualSellingPrice: data.actualSellingPrice,  // ✅
  isAvailable:        data.isAvailable,
});

      // ── Step 4: load full lists in background so user can
      // change selection if needed
      this.loadRestaurantsForEdit(restaurantId);
      this.loadVariantsForEdit(variantId);

    } else {
      this.editId = '';
      this.loadRestaurants(true);
      this.loadVariants(true);
    }
  }

  get f() { return this.priceForm.controls; }

  // ── Load restaurants — merges selected item at top ───────
  loadRestaurantsForEdit(selectedId: string) {
    this.restaurantPage  = 1;
    this.restaurantDone  = false;
    this.restaurantSearch = '';
    this.isLoadingRestaurants = true;

    this.apollo.query({
      query: GET_RESTAURANTS,
      variables: { page: 1, limit: this.restaurantLimit, search: null },
      fetchPolicy: 'network-only',
    })
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (res: any) => {
        const incoming: any[] = res?.data?.restaurants?.data || [];

        // ── Keep selected item at top, avoid duplicate ───
        const others = incoming.filter((r: any) => r.id !== selectedId);
        const selected = this.restaurants.find((r: any) => r.id === selectedId);
        this.restaurants = selected ? [selected, ...others] : incoming;

        if (incoming.length < this.restaurantLimit) this.restaurantDone = true;
        this.restaurantPage = 2;
        this.isLoadingRestaurants = false;
      },
      error: () => (this.isLoadingRestaurants = false),
    });
  }

  loadVariantsForEdit(selectedId: string) {
    this.variantPage  = 1;
    this.variantDone  = false;
    this.variantSearch = '';
    this.isLoadingVariants = true;

    this.apollo.query({
      query: GET_PRODUCT_VARIANTS,
      variables: { input: { page: 1, limit: this.variantLimit, search: '' } },
      fetchPolicy: 'network-only',
    })
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (res: any) => {
        const incoming: any[] = res?.data?.getProductVariants?.data || [];
        const active = incoming.filter((v: any) => v.isActive);

        // ── Keep selected item at top, avoid duplicate ───
        const others   = active.filter((v: any) => v._id !== selectedId);
        const selected = this.productVarients.find((v: any) => v._id === selectedId);
        this.productVarients = selected ? [selected, ...others] : active;

        if (incoming.length < this.variantLimit) this.variantDone = true;
        this.variantPage = 2;
        this.isLoadingVariants = false;
      },
      error: () => (this.isLoadingVariants = false),
    });
  }

  // ── Normal load for add mode ─────────────────────────────
  loadRestaurants(reset = false) {
    if (reset) {
      this.restaurants     = [];
      this.restaurantPage  = 1;
      this.restaurantDone  = false;
    }
    if (this.restaurantDone || this.isLoadingRestaurants) return;

    this.isLoadingRestaurants = true;

    this.apollo.query({
      query: GET_RESTAURANTS,
      variables: {
        page:   this.restaurantPage,
        limit:  this.restaurantLimit,
        search: this.restaurantSearch || null,
      },
      fetchPolicy: 'network-only',
    })
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (res: any) => {
        const incoming: any[] = res?.data?.restaurants?.data || [];
        this.restaurants = [...this.restaurants, ...incoming];
        if (incoming.length < this.restaurantLimit) this.restaurantDone = true;
        this.restaurantPage++;
        this.isLoadingRestaurants = false;
      },
      error: () => (this.isLoadingRestaurants = false),
    });
  }

  onRestaurantOpen()      { this.loadRestaurants(true); }
  onRestaurantScrollEnd() { this.loadRestaurants(); }
  onRestaurantSearch(event: { term: string }) {
    this.restaurantSearchSubject.next(event.term);
  }

  // ── Normal load for add mode ─────────────────────────────
  loadVariants(reset = false) {
    if (reset) {
      this.productVarients = [];
      this.variantPage     = 1;
      this.variantDone     = false;
    }
    if (this.variantDone || this.isLoadingVariants) return;

    this.isLoadingVariants = true;

    this.apollo.query({
      query: GET_PRODUCT_VARIANTS,
      variables: {
        input: {
          page:   this.variantPage,
          limit:  this.variantLimit,
          search: this.variantSearch,
        }
      },
      fetchPolicy: 'network-only',
    })
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (res: any) => {
        const incoming: any[] = res?.data?.getProductVariants?.data || [];
        const active = incoming.filter((v: any) => v.isActive);
        this.productVarients = [...this.productVarients, ...active];
        if (incoming.length < this.variantLimit) this.variantDone = true;
        this.variantPage++;
        this.isLoadingVariants = false;
      },
      error: () => {
        this.toastr.error('Failed to load variants');
        this.isLoadingVariants = false;
      },
    });
  }

  onVariantOpen()      { this.loadVariants(true); }
  onVariantScrollEnd() { this.loadVariants(); }
  onVariantSearch(event: { term: string }) {
    this.variantSearchSubject.next(event.term);
  }

  disableClientFilter() { return true; }

  // ── Submit ───────────────────────────────────────────────
  submit() {
    if (this.priceForm.invalid) {
      this.priceForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    const mutation = this.mode === 'add'
      ? CREATE_RESTAURANT_VARIANT_PRICE
      : UPDATE_RESTAURANT_VARIANT_PRICE;

    const input = this.mode === 'add'
      ? { ...this.priceForm.value }
      : { _id: this.editId, ...this.priceForm.value };

    this.apollo
      .mutate({ mutation, variables: { input } })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toastr.success(
            this.mode === 'add' ? 'Price added successfully!' : 'Price updated successfully!'
          );
          this.isSubmitting = false;
          this.onClose();
        },
        error: (err) => {
          console.error(err);
          this.toastr.error('Something went wrong');
          this.isSubmitting = false;
        },
      });
  }

  onClose() {
    this.priceForm.reset({ isAvailable: true });
    this.close.emit();
  }
}