import { Component, EventEmitter, OnInit, OnDestroy, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { Apollo } from 'apollo-angular';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

import {CREATE_RESTAURANT_INGREDIENTS_STOCK, UPDATE_RESTAURANT_INGREDIENTS_STOCK} from '../../graphql/restaurent-ingredient-stock/mutation';

import { GET_RESTAURANTS } from '../../graphql/restraurentmanagement/restraurent-query';
import { GET_INGREDIENTS } from '../../graphql/ingredientmanagement/ingredientmanagement.query';

@Component({
  selector: 'app-restaurant-ingredients-stock-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgSelectModule],
  templateUrl: './restaurant-ingredients-stock-form.component.html',
  styleUrl: './restaurant-ingredients-stock-form.component.css',
})
export class RestaurantIngredientsStockFormComponent implements OnInit, OnDestroy {

  @Output() close = new EventEmitter<void>();

  mode: 'add' | 'edit' = 'add';
  isSubmitting = false;
  editId = '';

  // ── Restaurants ──────────────────────────────────────────
  restaurants: any[]       = [];
  isLoadingRestaurants     = false;
  private restaurantPage   = 1;
  private restaurantLimit  = 10;
  private restaurantSearch = '';
  private restaurantDone   = false;
  private restaurantSearchSubject = new Subject<string>();

  // ── Ingredients ──────────────────────────────────────────
  ingredients: any[]       = [];
  isLoadingIngredients     = false;
  private ingredientPage   = 1;
  private ingredientLimit  = 10;
  private ingredientSearch = '';
  private ingredientDone   = false;
  private ingredientSearchSubject = new Subject<string>();

  // ── Form ─────────────────────────────────────────────────
  stockForm!: FormGroup;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private apollo: Apollo,
    private toastr: ToastrService,
  ) {}

  ngOnInit() {
    this.buildForm();

    this.restaurantSearchSubject.pipe(
      debounceTime(400), distinctUntilChanged(), takeUntil(this.destroy$),
    ).subscribe(term => { this.restaurantSearch = term; this.loadRestaurants(true); });

    this.ingredientSearchSubject.pipe(
      debounceTime(400), distinctUntilChanged(), takeUntil(this.destroy$),
    ).subscribe(term => { this.ingredientSearch = term; this.loadIngredients(true); });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  buildForm() {
    this.stockForm = this.fb.group({
      restaurantId: ['',   Validators.required],
      ingredientId: ['',   Validators.required],
      availableQty: [null, [Validators.required, Validators.min(0)]],
      alertLevel:   [null, [Validators.required, Validators.min(0)]],
    });
  }

  // ── Called from parent via @ViewChild ────────────────────
  openFormFromParent(mode: 'add' | 'edit', data?: any) {
    this.mode = mode;
    this.stockForm.reset();

    if (mode === 'edit' && data) {
      this.editId = data._id;

      const restaurantId = data.restaurant?._id?.toString();
      const ingredientId = data.ingredient?._id?.toString();

      // Pre-seed dropdowns
      this.restaurants = [{
        id:             restaurantId,
        restaurantName: data.restaurant?.name || '',
      }];

      this.ingredients = [{
        _id:  ingredientId,
        name: data.ingredient?.name || '',
        unit: data.ingredient?.unit || '',
      }];

      this.stockForm.patchValue({
        restaurantId: restaurantId,
        ingredientId: ingredientId,
        availableQty: data.availableQty,
        alertLevel:   data.alertLevel,
      });

      this.loadRestaurantsForEdit(restaurantId);
      this.loadIngredientsForEdit(ingredientId);

    } else {
      this.editId = '';
      this.loadRestaurants(true);
      this.loadIngredients(true);
    }
  }

  get f() { return this.stockForm.controls; }

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

  // ── Ingredients ──────────────────────────────────────────
  loadIngredients(reset = false) {
    if (reset) { this.ingredients = []; this.ingredientPage = 1; this.ingredientDone = false; }
    if (this.ingredientDone || this.isLoadingIngredients) return;
    this.isLoadingIngredients = true;

    this.apollo.query({
      query: GET_INGREDIENTS,
      variables: { page: this.ingredientPage, limit: this.ingredientLimit, search: this.ingredientSearch },
      fetchPolicy: 'network-only',
    })
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (res: any) => {
        const incoming = res?.data?.getIngredients?.data || [];
        this.ingredients = [...this.ingredients, ...incoming];
        if (incoming.length < this.ingredientLimit) this.ingredientDone = true;
        this.ingredientPage++;
        this.isLoadingIngredients = false;
      },
      error: () => (this.isLoadingIngredients = false),
    });
  }

  loadIngredientsForEdit(selectedId: string) {
    this.ingredientPage = 1; this.ingredientDone = false;
    this.isLoadingIngredients = true;

    this.apollo.query({
      query: GET_INGREDIENTS,
      variables: { page: 1, limit: this.ingredientLimit, search: '' },
      fetchPolicy: 'network-only',
    })
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (res: any) => {
        const incoming = res?.data?.getIngredients?.data || [];
        const others   = incoming.filter((i: any) => i._id !== selectedId);
        const selected = this.ingredients.find((i: any) => i._id === selectedId);
        this.ingredients = selected ? [selected, ...others] : incoming;
        if (incoming.length < this.ingredientLimit) this.ingredientDone = true;
        this.ingredientPage = 2;
        this.isLoadingIngredients = false;
      },
      error: () => (this.isLoadingIngredients = false),
    });
  }

  onIngredientOpen()      { this.loadIngredients(true); }
  onIngredientScrollEnd() { this.loadIngredients(); }
  onIngredientSearch(e: { term: string }) { this.ingredientSearchSubject.next(e.term); }

  disableClientFilter() { return true; }

  // ── Submit ───────────────────────────────────────────────
  submit() {
    if (this.stockForm.invalid) {
      this.stockForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    const mutation = this.mode === 'add'
      ? CREATE_RESTAURANT_INGREDIENTS_STOCK
      : UPDATE_RESTAURANT_INGREDIENTS_STOCK;

    const input = this.mode === 'add'
      ? { ...this.stockForm.value }
      : { _id: this.editId, ...this.stockForm.value };

    this.apollo.mutate({ mutation, variables: { input } })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toastr.success(this.mode === 'add' ? 'Stock added!' : 'Stock updated!');
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
    this.stockForm.reset();
    this.close.emit();
  }
}