import { Component, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Apollo } from 'apollo-angular';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

import { LayoutsModule } from '../../layouts/layouts.module';
import { HeaderComponent } from '../../layouts/header/header.component';
import { OffersFormComponent } from '../../shared/offers-form/offers-form.component';

import { GET_OFFERS }    from '../../graphql/offers/query';
import { DELETE_OFFER }  from '../../graphql/offers/mutation';

@Component({
  selector: 'app-offers',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LayoutsModule,
    HeaderComponent,
    OffersFormComponent,
  ],
  templateUrl: './offers.component.html',
  styleUrl: './offers.component.css',
})
export class OffersComponent implements OnInit, OnDestroy {

  @ViewChild(OffersFormComponent) child!: OffersFormComponent;

  showForm  = false;
  offers: any[] = [];
  isLoading = false;

  currentPage = 1;
  limit       = 10;
  total       = 0;
  totalPages  = 0;
  hasNextPage = false;
  hasPrevPage = false;

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
      this.loadOffers();
    });

    this.loadOffers();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearchChange(value: string) {
    this.searchTerm = value;
    this.searchSubject.next(value);
  }

  loadOffers() {
    this.isLoading = true;

    this.apollo.watchQuery({
      query: GET_OFFERS,
      variables: { page: this.currentPage, limit: this.limit, search: this.searchTerm },
      fetchPolicy: 'network-only',
    })
    .valueChanges
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (res: any) => {
        const result     = res.data.getOffers;
        this.offers      = result.data;
        this.total       = result.total;
        this.totalPages  = result.totalPages;
        this.hasNextPage = result.hasNextPage;
        this.hasPrevPage = result.hasPrevPage;
        this.isLoading   = false;
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
    this.loadOffers();
  }

  deleteOffer(id: string) {
    if (!confirm('Delete this offer?')) return;

    this.apollo.mutate({
      mutation: DELETE_OFFER,
      variables: { id },
    })
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: () => {
        this.toastr.success('Offer deleted');
        this.loadOffers();
      },
      error: () => this.toastr.error('Delete failed'),
    });
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.loadOffers();
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  getSerial(index: number): number {
    return (this.currentPage - 1) * this.limit + index + 1;
  }
}