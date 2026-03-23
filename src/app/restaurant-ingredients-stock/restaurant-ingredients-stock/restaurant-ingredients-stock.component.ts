import { Component, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Apollo } from 'apollo-angular';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

import { LayoutsModule } from '../../layouts/layouts.module';
import { HeaderComponent } from '../../layouts/header/header.component';
import { RestaurantIngredientsStockFormComponent } from '../../shared/restaurant-ingredients-stock-form/restaurant-ingredients-stock-form.component';

import { GET_RESTAURANT_INGREDIENTS_STOCKS } from '../../graphql/restaurent-ingredient-stock/query';
import { DELETE_RESTAURANT_INGREDIENTS_STOCK } from '../../graphql/restaurent-ingredient-stock/mutation';

@Component({
  selector: 'app-restaurant-ingredients-stock',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LayoutsModule,
    HeaderComponent,
    RestaurantIngredientsStockFormComponent,
  ],
  templateUrl: './restaurant-ingredients-stock.component.html',
  styleUrl: './restaurant-ingredients-stock.component.css',
})
export class RestaurantIngredientsStockComponent implements OnInit, OnDestroy {

  @ViewChild(RestaurantIngredientsStockFormComponent)
  child!: RestaurantIngredientsStockFormComponent;

  showForm  = false;
  stocks: any[] = [];
  isLoading = false;

  // ── Pagination ───────────────────────────────────────────
  currentPage = 1;
  limit       = 10;
  total       = 0;
  totalPages  = 0;
  hasNextPage = false;
  hasPrevPage = false;

  // ── Search ───────────────────────────────────────────────
  searchTerm = '';
  private searchSubject = new Subject<string>();
  private destroy$      = new Subject<void>();

  constructor(
    private apollo: Apollo,
    private toastr: ToastrService,
  ) {}

  ngOnInit() {
    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      takeUntil(this.destroy$),
    ).subscribe(() => {
      this.currentPage = 1;
      this.loadStocks();
    });

    this.loadStocks();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearchChange(value: string) {
    this.searchTerm = value;
    this.searchSubject.next(value);
  }

  loadStocks() {
    this.isLoading = true;

    this.apollo.watchQuery({
      query: GET_RESTAURANT_INGREDIENTS_STOCKS,
      variables: {
        page:   this.currentPage,
        limit:  this.limit,
        search: this.searchTerm,
      },
      fetchPolicy: 'network-only',
    })
    .valueChanges
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (res: any) => {
        const result      = res.data.getRestaurantIngredientsStocks;
        this.stocks       = result.data;
        this.total        = result.total;
        this.totalPages   = result.totalPages;
        this.hasNextPage  = result.hasNextPage;
        this.hasPrevPage  = result.hasPrevPage;
        this.isLoading    = false;
      },
      error: () => (this.isLoading = false),
    });
  }

  openForm(mode: 'add' | 'edit', data?: any) {
    this.showForm = true;
    setTimeout(() => this.child?.openFormFromParent(mode, data));
  }

  closeForm() {
    this.showForm = false;
    this.loadStocks();
  }

  deleteStock(id: string) {
    if (!confirm('Delete this stock entry?')) return;

    this.apollo.mutate({
      mutation: DELETE_RESTAURANT_INGREDIENTS_STOCK,
      variables: { id },
    })
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: () => {
        this.toastr.success('Deleted successfully');
        this.loadStocks();
      },
      error: () => this.toastr.error('Delete failed'),
    });
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.loadStocks();
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  getSerial(index: number): number {
    return (this.currentPage - 1) * this.limit + index + 1;
  }
}