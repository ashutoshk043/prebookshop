import { Component, EventEmitter, OnInit, OnDestroy, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { Apollo } from 'apollo-angular';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

import { CREATE_COUPON, UPDATE_COUPON } from '../../graphql/coupons/mutation';
import { GET_RESTAURANTS } from '../../graphql/restraurentmanagement/restraurent-query';

@Component({
  selector: 'app-coupons-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgSelectModule],
  templateUrl: './coupons-form.component.html',
  styleUrl: './coupons-form.component.css',
})
export class CouponsFormComponent implements OnInit, OnDestroy {

  @Output() close = new EventEmitter<void>();

  mode: 'add' | 'edit' = 'add';
  isSubmitting = false;
  editId = '';

  discountTypes = ['PERCENT', 'FLAT'];

  // ── Restaurants ──────────────────────────────────────────
  restaurants: any[]       = [];
  isLoadingRestaurants     = false;
  private restaurantPage   = 1;
  private restaurantLimit  = 10;
  private restaurantSearch = '';
  private restaurantDone   = false;
  private restaurantSearchSubject = new Subject<string>();

  // ── Form ─────────────────────────────────────────────────
  couponForm!: FormGroup;
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
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  buildForm() {
    this.couponForm = this.fb.group({
      restaurantId:      ['',   Validators.required],
      code:              ['',   [Validators.required, Validators.minLength(3)]],
      discountType:      ['',   Validators.required],
      discountValue:     [null, [Validators.required, Validators.min(1)]],
      minOrderValue:     [0,    [Validators.required, Validators.min(0)]],
      usageLimitPerUser: [1,    [Validators.required, Validators.min(1)]],
      isActive:          [true],
      expiryDate:        ['',   Validators.required],
    });
  }

  // ── Called from parent via @ViewChild ────────────────────
  openFormFromParent(mode: 'add' | 'edit', data?: any) {
    this.mode = mode;
    this.couponForm.reset({ isActive: true, minOrderValue: 0, usageLimitPerUser: 1 });

    if (mode === 'edit' && data) {
      this.editId = data._id;

      const restaurantId = data.restaurant?._id?.toString();

      this.restaurants = [{
        id:             restaurantId,
        restaurantName: data.restaurant?.name || '',
      }];

      this.couponForm.patchValue({
        restaurantId:      restaurantId,
        code:              data.code,
        discountType:      data.discountType,
        discountValue:     data.discountValue,
        minOrderValue:     data.minOrderValue,
        usageLimitPerUser: data.usageLimitPerUser,
        isActive:          data.isActive,
        expiryDate:        this.formatDate(data.expiryDate),
      });

      this.loadRestaurantsForEdit(restaurantId);

    } else {
      this.editId = '';
      this.loadRestaurants(true);
    }
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    return new Date(dateStr).toISOString().split('T')[0];
  }

  get f() { return this.couponForm.controls; }

  // ── Restaurants ──────────────────────────────────────────
  loadRestaurants(reset = false) {
    if (reset) { this.restaurants = []; this.restaurantPage = 1; this.restaurantDone = false; }
    if (this.restaurantDone || this.isLoadingRestaurants) return;
    this.isLoadingRestaurants = true;

    this.apollo.query({
      query: GET_RESTAURANTS,
      variables: { page: this.restaurantPage, limit: this.restaurantLimit, search: this.restaurantSearch || null },
      fetchPolicy: 'network-only',
    })
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (res: any) => {
        const incoming = res?.data?.restaurants?.data || [];
        this.restaurants = [...this.restaurants, ...incoming];
        if (incoming.length < this.restaurantLimit) this.restaurantDone = true;
        this.restaurantPage++;
        this.isLoadingRestaurants = false;
      },
      error: () => (this.isLoadingRestaurants = false),
    });
  }

  loadRestaurantsForEdit(selectedId: string) {
    this.restaurantPage = 1; this.restaurantDone = false;
    this.isLoadingRestaurants = true;

    this.apollo.query({
      query: GET_RESTAURANTS,
      variables: { page: 1, limit: this.restaurantLimit, search: null },
      fetchPolicy: 'network-only',
    })
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (res: any) => {
        const incoming = res?.data?.restaurants?.data || [];
        const others   = incoming.filter((r: any) => r.id !== selectedId);
        const selected = this.restaurants.find((r: any) => r.id === selectedId);
        this.restaurants = selected ? [selected, ...others] : incoming;
        if (incoming.length < this.restaurantLimit) this.restaurantDone = true;
        this.restaurantPage = 2;
        this.isLoadingRestaurants = false;
      },
      error: () => (this.isLoadingRestaurants = false),
    });
  }

  onRestaurantOpen()      { this.loadRestaurants(true); }
  onRestaurantScrollEnd() { this.loadRestaurants(); }
  onRestaurantSearch(e: { term: string }) { this.restaurantSearchSubject.next(e.term); }

  disableClientFilter() { return true; }

  // ── Submit ───────────────────────────────────────────────
  submit() {
    if (this.couponForm.invalid) {
      this.couponForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    const mutation = this.mode === 'add' ? CREATE_COUPON : UPDATE_COUPON;
    const input    = this.mode === 'add'
      ? { ...this.couponForm.value }
      : { _id: this.editId, ...this.couponForm.value };

    this.apollo.mutate({ mutation, variables: { input } })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toastr.success(this.mode === 'add' ? 'Coupon added!' : 'Coupon updated!');
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
    this.couponForm.reset({ isActive: true, minOrderValue: 0, usageLimitPerUser: 1 });
    this.close.emit();
  }
}