import { Component, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Apollo } from 'apollo-angular';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

import { LayoutsModule }    from '../layouts/layouts.module';
import { HeaderComponent }  from '../layouts/header/header.component';
import { SidebarComponent } from '../layouts/sidebar/sidebar.component';
import { OrderFormComponent }     from '../shared/order-form/order-form.component';
import { OrderEditFormComponent } from '../shared/order-edit-form/order-edit-form.component';

import { GET_ORDERS }   from '../graphql/orders/query';
import { DELETE_ORDER } from '../graphql/orders/mutation';

@Component({
  selector: 'app-ordermanagement',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LayoutsModule,
    HeaderComponent,
    SidebarComponent,
    OrderFormComponent,
    OrderEditFormComponent,  // ✅
  ],
  templateUrl: './ordermanagement.component.html',
  styleUrl: './ordermanagement.component.css',
})
export class OrdermanagementComponent implements OnInit, OnDestroy {

  @ViewChild(OrderFormComponent)     child!:      OrderFormComponent;
  @ViewChild(OrderEditFormComponent) editChild!:  OrderEditFormComponent;

  showForm     = false;
  showEditForm = false;
  editingOrder: any = null;

  orders: any[] = [];
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

  statusColors: Record<string, { bg: string; color: string }> = {
    PENDING:   { bg: '#fef9c3', color: '#854d0e' },
    ACCEPTED:  { bg: '#dbeafe', color: '#1d4ed8' },
    PREPARING: { bg: '#ffedd5', color: '#c2410c' },
    READY:     { bg: '#dcfce7', color: '#15803d' },
    DELIVERED: { bg: '#d1fae5', color: '#065f46' },
    CANCELLED: { bg: '#fee2e2', color: '#dc2626' },
  };

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
      this.loadOrders();
    });

    this.loadOrders();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearchChange(value: string) {
    this.searchTerm = value;
    this.searchSubject.next(value);
  }

  loadOrders() {
    this.isLoading = true;

    this.apollo.watchQuery({
      query: GET_ORDERS,
      variables: { page: this.currentPage, limit: this.limit, search: this.searchTerm },
      fetchPolicy: 'network-only',
    })
    .valueChanges
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (res: any) => {
        const result     = res.data.getOrders;
        this.orders      = result.data;
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
    if (mode === 'add') {
      this.showForm = true;
      setTimeout(() => this.child?.openFormFromParent(mode, data));
    } else {
      this.editingOrder = data;
      this.showEditForm = true;
      setTimeout(() => this.editChild?.openWithOrder(data));
    }
  }

  closeForm() {
    this.showForm = false;
    this.loadOrders();
  }

  closeEditForm() {
    this.showEditForm = false;
    this.editingOrder = null;
    this.loadOrders();
  }

  deleteOrder(id: string) {
    if (!confirm('Delete this order? Inventory will be restored.')) return;

    this.apollo.mutate({ mutation: DELETE_ORDER, variables: { id } })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toastr.success('Order deleted & inventory restored');
          this.loadOrders();
        },
        error: () => this.toastr.error('Delete failed'),
      });
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.loadOrders();
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  getSerial(index: number): number {
    return (this.currentPage - 1) * this.limit + index + 1;
  }

  getStatusStyle(status: string) {
    return this.statusColors[status] || { bg: '#f3f4f6', color: '#374151' };
  }

  onOverlayClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('pos-modal-overlay')) {
      this.closeForm();
    }
  }
}