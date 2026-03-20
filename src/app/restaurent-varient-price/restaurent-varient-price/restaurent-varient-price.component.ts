import { Component, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Apollo } from 'apollo-angular';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

import { LayoutsModule } from '../../layouts/layouts.module';
import { HeaderComponent } from '../../layouts/header/header.component';
import { RestaurantVariantPriceFormComponent } from '../../shared/rastaurent-varient-price-form/rastaurent-varient-price-form.component';

import { GET_RESTAURANT_VARIANT_PRICES } from '../../graphql/restaurant-variant-price/query';
import { DELETE_RESTAURANT_VARIANT_PRICE } from '../../graphql/restaurant-variant-price/mutation';

@Component({
  selector: 'app-rastaurent-varient-price',
  standalone: true,
  imports: [
    CommonModule,
    LayoutsModule,
    RestaurantVariantPriceFormComponent,
    HeaderComponent,
  ],
  templateUrl: './restaurent-varient-price.component.html',
  styleUrl: './restaurent-varient-price.component.css'
})
export class RestaurantVariantPriceComponent implements OnInit, OnDestroy {

  @ViewChild(RestaurantVariantPriceFormComponent)
  child!: RestaurantVariantPriceFormComponent;

  showForm  = false;
  prices: any[] = [];
  isLoading = false;
  total     = 0;

  private destroy$ = new Subject<void>();

  constructor(
    private apollo: Apollo,
    private toastr: ToastrService,
  ) {}

  ngOnInit() {
    this.loadPrices();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadPrices() {
    this.isLoading = true;

    this.apollo.watchQuery({
      query: GET_RESTAURANT_VARIANT_PRICES,
      fetchPolicy: 'network-only',
    })
    .valueChanges
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (res: any) => {
        const result   = res.data.getRestaurantVariantPrices;
        this.prices    = result.data;
        this.total     = result.total;
        this.isLoading = false;
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
    this.loadPrices();
  }

  deletePrice(id: string) {
    if (!confirm('Delete this price entry?')) return;

    this.apollo.mutate({
      mutation: DELETE_RESTAURANT_VARIANT_PRICE,
      variables: { id },
    })
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: () => {
        this.toastr.success('Deleted successfully');
        this.loadPrices();
      },
      error: () => this.toastr.error('Delete failed'),
    });
  }
}