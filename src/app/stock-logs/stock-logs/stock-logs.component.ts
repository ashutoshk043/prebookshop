// stock-logs.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Apollo, gql } from 'apollo-angular';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { HeaderComponent } from '../../layouts/header/header.component';
import { SidebarComponent } from '../../layouts/sidebar/sidebar.component';

const GET_STOCK_LOGS = gql`
  query GetStockLogs(
    $page: Int
    $limit: Int
    $search: String
    $reason: String
    $fromDate: String
    $toDate: String
  ) {
    getStockLogs(
      page: $page
      limit: $limit
      search: $search
      reason: $reason
      fromDate: $fromDate
      toDate: $toDate
    ) {
      docs {
        _id
        orderNumber
        reason
        changeQty
        changeLabel
        note
        createdAt
        ingredient { _id name unit }
        restaurant { _id name }
      }
      meta {
        total
        page
        limit
        totalPages
        hasNextPage
        hasPrevPage
      }
    }
  }
`;

@Component({
  selector: 'app-stock-logs',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent, SidebarComponent],
  templateUrl: './stock-logs.component.html',
  styleUrl: './stock-logs.component.css',
})
export class StockLogsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  logs: any[] = [];
  meta: any = null;
  loading = false;
  error = '';

  // Filters
  search = '';
  reason = '';
  fromDate = '';
  toDate = '';
  page = 1;
  limit = 10;

  reasons = ['', 'ORDER', 'RETURN', 'WASTAGE', 'MANUAL_ADD', 'MANUAL_SUB'];

  constructor(private apollo: Apollo) {}

  ngOnInit() {
    // Debounce search input
    this.searchSubject
      .pipe(debounceTime(400), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => {
        this.page = 1;
        this.fetchLogs();
      });

    this.fetchLogs();
  }

  fetchLogs() {
    this.loading = true;
    this.error = '';

    this.apollo
      .watchQuery({
        query: GET_STOCK_LOGS,
        variables: {
          page: this.page,
          limit: this.limit,
          search: this.search || undefined,
          reason: this.reason || undefined,
          fromDate: this.fromDate || undefined,
          toDate: this.toDate || undefined,
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ({ data, loading }: any) => {
          this.loading = loading;
          this.logs = data?.getStockLogs?.docs ?? [];
          this.meta = data?.getStockLogs?.meta ?? null;
        },
        error: (err) => {
          this.loading = false;
          this.error = err.message || 'Failed to load stock logs';
        },
      });
  }

  onSearchChange(value: string) {
    this.search = value;
    this.searchSubject.next(value);
  }

  onFilterChange() {
    this.page = 1;
    this.fetchLogs();
  }

  onPageChange(newPage: number) {
    this.page = newPage;
    this.fetchLogs();
  }

  resetFilters() {
    this.search = '';
    this.reason = '';
    this.fromDate = '';
    this.toDate = '';
    this.page = 1;
    this.fetchLogs();
  }

  isDeduction(changeQty: number): boolean {
    return changeQty < 0;
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  }

  get pages(): number[] {
    if (!this.meta) return [];
    return Array.from({ length: this.meta.totalPages }, (_, i) => i + 1);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}