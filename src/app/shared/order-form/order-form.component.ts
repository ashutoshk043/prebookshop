import { Component, EventEmitter, OnInit, OnDestroy, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Apollo } from 'apollo-angular';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

import { CREATE_ORDER } from '../../graphql/orders/mutation';
import { GET_RESTAURANTS } from '../../graphql/restraurentmanagement/restraurent-query';
import { GET_RESTAURANT_VARIANT_PRICES } from '../../graphql/restaurant-variant-price/query';

@Component({
  selector: 'app-order-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './order-form.component.html',
  styleUrl: './order-form.component.css',
})
export class OrderFormComponent implements OnInit, OnDestroy {

  @Output() close = new EventEmitter<void>();

  isSubmitting = false;
  showPayModal = false;
  orderSuccess = false;

  // ── Dropdown options ─────────────────────────────────────
  tables   = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6'];
  types    = ['Dine In', 'Takeaway', 'Delivery'];
  payModes = ['CASH', 'CARD', 'UPI', 'ONLINE'];

  // ── Menu ─────────────────────────────────────────────────
  allItems: any[]      = [];
  filteredItems: any[] = [];
  categories: string[] = [];
  isLoadingMenu        = false;

  // ── Restaurants ──────────────────────────────────────────
  restaurants: any[]   = [];
  isLoadingRestaurants = false;
  private restaurantLimit = 20;

  // ── Active category (UI only) ────────────────────────────
  activeCategory = 'All';

  // ── Form ─────────────────────────────────────────────────
  posForm!: FormGroup;

  private menuSearchSubject = new Subject<string>();
  private destroy$          = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private apollo: Apollo,
    private toastr: ToastrService,
  ) {}

  ngOnInit() {
    this.buildForm();
    this.watchComputedFields();
    this.loadRestaurants();

    this.menuSearchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$),
    ).subscribe(() => this.applyFilter());

    // ── Watch restaurantId change → reload menu ──────────
    this.posForm.get('restaurantId')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(val => {
        if (val) {
          this.cartItems.clear();
          this.recalculate();
          this.loadMenu();
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ══════════════════════════════════════════════════════════
  // BUILD FORM — every field stored in FormGroup
  // ══════════════════════════════════════════════════════════
  buildForm() {
    this.posForm = this.fb.group({

      // ── Order meta ───────────────────────────────────────
      restaurantId:   ['', Validators.required],
      table:          ['T1', Validators.required],
      orderType:      ['Dine In', Validators.required],
      paymentMode:    ['CASH', Validators.required],

      // ── Menu search (UI only) ────────────────────────────
      menuSearch:     [''],
      activeCategory: ['All'],

      // ── Coupon ───────────────────────────────────────────
      couponCode:     [''],
      couponApplied:  [false],
      couponLabel:    [''],
      couponDiscount: [0],

      // ── Cart items (FormArray) ───────────────────────────
      cartItems: this.fb.array([]),

      // ── Computed totals (auto-calculated) ───────────────
      subTotal:    [{ value: 0, disabled: true }],
      taxRate:     [{ value: 5, disabled: true }],   // 5%
      taxAmount:   [{ value: 0, disabled: true }],
      grandTotal:  [{ value: 0, disabled: true }],
      itemCount:   [{ value: 0, disabled: true }],
    });
  }

  // ══════════════════════════════════════════════════════════
  // WATCH & AUTO-CALCULATE
  // ══════════════════════════════════════════════════════════
  watchComputedFields() {
    // ✅ Recalculate whenever coupon discount changes
    this.posForm.get('couponDiscount')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.recalculate());
  }

  recalculate() {
    const subTotal      = this.cartEntries.reduce((s, e) => s + e.price * e.qty, 0);
    const couponDiscount = this.posForm.get('couponDiscount')?.value || 0;
    const taxRate        = this.posForm.get('taxRate')?.value || 5;
    const taxAmount      = Math.round(subTotal * (taxRate / 100));
    const grandTotal     = Math.max(0, subTotal - couponDiscount + taxAmount);
    const itemCount      = this.cartEntries.reduce((s, e) => s + e.qty, 0);

    // ✅ All computed values stored in form
    this.posForm.patchValue({
      subTotal,
      taxAmount,
      grandTotal,
      itemCount,
    }, { emitEvent: false });
  }

  // ══════════════════════════════════════════════════════════
  // CART FORMARRAY
  // ══════════════════════════════════════════════════════════
  get cartItems(): FormArray {
    return this.posForm.get('cartItems') as FormArray;
  }

  get cartEntries(): any[] {
    return this.cartItems.controls.map(c => c.value);
  }

  addItem(item: any) {
    const existingIndex = this.cartItems.controls.findIndex(
      c => c.get('priceId')?.value === item._id
    );

    if (existingIndex >= 0) {
      // ── Increment qty ────────────────────────────────────
      const ctrl = this.cartItems.at(existingIndex);
      const newQty = (ctrl.get('qty')?.value || 0) + 1;
      ctrl.patchValue({ qty: newQty, lineTotal: item.price * newQty });
    } else {
      // ── Add new row ──────────────────────────────────────
      this.cartItems.push(this.fb.group({
        priceId:   [item._id],
        productId: [item.productId],
        variantId: [item.variantId],
        name:      [item.name],
        variant:   [item.variant],
        category:  [item.category],
        price:     [item.price],
        qty:       [1,           [Validators.required, Validators.min(1)]],
        lineTotal: [item.price],  // price × qty
      }));
    }

    this.recalculate();
  }

  changeQty(index: number, delta: number) {
    const ctrl   = this.cartItems.at(index);
    const newQty = (ctrl.get('qty')?.value || 0) + delta;

    if (newQty <= 0) {
      this.cartItems.removeAt(index);
    } else {
      const price = ctrl.get('price')?.value || 0;
      ctrl.patchValue({ qty: newQty, lineTotal: price * newQty });
    }

    this.recalculate();
  }

  removeItem(index: number) {
    this.cartItems.removeAt(index);
    this.recalculate();
  }

  // ── Getters for template ─────────────────────────────────
  get f()               { return this.posForm.controls; }
  get selectedRestaurantId() { return this.posForm.get('restaurantId')?.value  || ''; }
  get selectedTable()        { return this.posForm.get('table')?.value          || 'T1'; }
  get selectedType()         { return this.posForm.get('orderType')?.value      || 'Dine In'; }
  get selectedPayMode()      { return this.posForm.get('paymentMode')?.value    || 'CASH'; }
  get menuSearch()           { return this.posForm.get('menuSearch')?.value     || ''; }
  get subTotal()             { return this.posForm.get('subTotal')?.value       || 0; }
  get taxAmount()            { return this.posForm.get('taxAmount')?.value      || 0; }
  get grandTotal()           { return this.posForm.get('grandTotal')?.value     || 0; }
  get itemCount()            { return this.posForm.get('itemCount')?.value      || 0; }
  get couponDiscount()       { return this.posForm.get('couponDiscount')?.value || 0; }
  get discountLabel()        { return this.posForm.get('couponLabel')?.value    || ''; }
  get couponApplied()        { return this.posForm.get('couponApplied')?.value  || false; }

  // ── Load Restaurants ─────────────────────────────────────
  loadRestaurants() {
    this.isLoadingRestaurants = true;

    this.apollo.query({
      query: GET_RESTAURANTS,
      variables: { page: 1, limit: this.restaurantLimit, search: null },
      fetchPolicy: 'network-only',
    })
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (res: any) => {
        this.restaurants          = res?.data?.restaurants?.data || [];
        this.isLoadingRestaurants = false;

        if (!this.selectedRestaurantId && this.restaurants.length) {
          this.posForm.patchValue({ restaurantId: this.restaurants[0].id });
        }

        if (this.selectedRestaurantId) this.loadMenu();
      },
      error: () => (this.isLoadingRestaurants = false),
    });
  }

  // ── Load Menu ────────────────────────────────────────────
  loadMenu() {
    if (!this.selectedRestaurantId) return;
    this.isLoadingMenu = true;

    this.apollo.query({
      query: GET_RESTAURANT_VARIANT_PRICES,
      variables: { page: 1, limit: 100, search: '' },
      fetchPolicy: 'network-only',
    })
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (res: any) => {
        const data = res?.data?.getRestaurantVariantPrices?.data || [];

        this.allItems = data
          .map((d: any) => ({
            _id:         d._id,
            variantId:   d.variant?._id,
            productId:   d.product?._id,
            name:        d.product?.name  || 'Item',
            variant:     d.variant?.name  || '',
            price:       d.actualSellingPrice || d.mrp || 0,
            category:    d.product?.category  || 'Menu',
            isAvailable: d.isAvailable,
          }))
          .filter((i: any) => i.isAvailable);

        const cats = [...new Set(this.allItems.map((i: any) => i.category))] as string[];
        this.categories = ['All', ...cats];

        if (!this.categories.includes(this.activeCategory)) {
          this.activeCategory = 'All';
          this.posForm.patchValue({ activeCategory: 'All' }, { emitEvent: false });
        }

        this.applyFilter();
        this.isLoadingMenu = false;
      },
      error: () => (this.isLoadingMenu = false),
    });
  }

  // ── Category ─────────────────────────────────────────────
  setCategory(cat: string) {
    this.activeCategory = cat;
    this.posForm.patchValue({ activeCategory: cat }, { emitEvent: false });
    this.applyFilter();
  }

  applyFilter() {
    const term = this.menuSearch.toLowerCase();
    this.filteredItems = this.allItems.filter(i => {
      const catOk  = this.activeCategory === 'All' || i.category === this.activeCategory;
      const termOk = !term ||
        i.name.toLowerCase().includes(term) ||
        i.variant.toLowerCase().includes(term);
      return catOk && termOk;
    });
  }

  onMenuSearchChange(v: string) {
    this.posForm.patchValue({ menuSearch: v }, { emitEvent: false });
    this.menuSearchSubject.next(v);
  }

  clearMenuSearch() {
    this.posForm.patchValue({ menuSearch: '' }, { emitEvent: false });
    this.menuSearchSubject.next('');
  }

  // ── Coupon ───────────────────────────────────────────────
  applyCoupon() {
    const code = (this.posForm.get('couponCode')?.value || '').toUpperCase().trim();

    if (code === 'SAVE50') {
      this.posForm.patchValue({ couponDiscount: 50,  couponLabel: 'SAVE50', couponApplied: true });
      this.toastr.success('₹50 off applied!');
    } else if (code === 'FLAT20') {
      this.posForm.patchValue({ couponDiscount: 20,  couponLabel: 'FLAT20', couponApplied: true });
      this.toastr.success('₹20 off applied!');
    } else {
      this.posForm.patchValue({ couponDiscount: 0, couponLabel: '', couponApplied: false });
      this.toastr.error('Invalid coupon');
    }
  }

  removeCoupon() {
    this.posForm.patchValue({
      couponCode:     '',
      couponDiscount: 0,
      couponLabel:    '',
      couponApplied:  false,
    });
  }

  // ── Payment ──────────────────────────────────────────────
  openPayment() {
    if (this.cartItems.length === 0) {
      this.toastr.warning('Add items to cart first');
      return;
    }
    this.showPayModal = true;
  }

  closePayment() {
    this.showPayModal = false;
    this.orderSuccess = false;
  }

  // ── Confirm Order ────────────────────────────────────────
  confirmOrder() {
    if (this.posForm.invalid) {
      this.posForm.markAllAsTouched();
      this.toastr.warning('Please fill all required fields');
      return;
    }

    if (this.cartItems.length === 0) {
      this.toastr.warning('Cart is empty');
      return;
    }

    this.isSubmitting = true;

    // ✅ Read everything from form
    const fv        = this.posForm.getRawValue(); // getRawValue includes disabled fields
    const rawType   = fv.orderType;
    const orderType = rawType === 'Dine In'  ? 'POS'      :
                      rawType === 'Takeaway'  ? 'TAKEAWAY' : 'DELIVERY';

    const items = fv.cartItems.map((i: any) => ({
      productId: i.productId,
      variantId: i.variantId,
      price:     i.price,
      quantity:  i.qty,
    }));

    const input = {
      restaurantId: fv.restaurantId,
      orderType,
      status:       'ACCEPTED',
      items,
      discount:     fv.couponDiscount,
      paymentMode:  fv.paymentMode,
    };

    console.log('📤 Full form value:', JSON.stringify(fv, null, 2));
    console.log('📤 Order input:', JSON.stringify(input, null, 2));

    this.apollo.mutate({ mutation: CREATE_ORDER, variables: { input } })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          console.log('✅ Order placed:', JSON.stringify(res?.data, null, 2));
          this.isSubmitting = false;
          this.orderSuccess = true;
        },
        error: (err) => {
          console.error('❌ Order failed:', err);
          this.toastr.error('Order failed. Please try again.');
          this.isSubmitting = false;
        },
      });
  }

  // ── New Order — reset cart, keep restaurant/table ────────
  newOrder() {
    this.cartItems.clear();
    this.orderSuccess = false;
    this.showPayModal = false;
    this.activeCategory = 'All';

    this.posForm.patchValue({
      couponCode:     '',
      couponDiscount: 0,
      couponLabel:    '',
      couponApplied:  false,
      paymentMode:    'CASH',
      menuSearch:     '',
      activeCategory: 'All',
      subTotal:       0,
      taxAmount:      0,
      grandTotal:     0,
      itemCount:      0,
    }, { emitEvent: false });

    this.applyFilter();
    this.toastr.success('Ready for new order!');
  }

  openFormFromParent(mode: 'add' | 'edit', data?: any) {
    if (mode === 'edit' && data) {
      this.posForm.patchValue({
        orderType:   data.orderType,
        paymentMode: data.paymentMode,
      });
    }
  }

  getEmoji(category: string): string {
    const map: Record<string, string> = {
      'Drinks':      '🥤',
      'Desserts':    '🍰',
      'Pizza':       '🍕',
      'Burgers':     '🍔',
      'Sides':       '🍟',
      'Main Course': '🍛',
    };
    return map[category] || '🍽️';
  }

  onClose() { this.close.emit(); }
}