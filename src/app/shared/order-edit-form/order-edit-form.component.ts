import { Component, EventEmitter, OnInit, OnDestroy, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Apollo } from 'apollo-angular';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

import { UPDATE_ORDER } from '../../graphql/orders/mutation';

@Component({
  selector: 'app-order-edit-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './order-edit-form.component.html',
  styleUrl: './order-edit-form.component.css',
})
export class OrderEditFormComponent implements OnInit, OnDestroy {

  @Output() close  = new EventEmitter<void>();
  @Output() saved  = new EventEmitter<void>();

  isSubmitting = false;
  order: any   = null;

  // ── Editable fields ──────────────────────────────────────
  selectedStatus:    string = '';
  selectedPayMode:   string = '';
  discountValue:     number = 0;

  // ── Dropdown options ─────────────────────────────────────
  statuses = [
    { value: 'PENDING',   label: 'Pending',   color: '#854d0e', bg: '#fef9c3' },
    { value: 'ACCEPTED',  label: 'Accepted',  color: '#1d4ed8', bg: '#dbeafe' },
    { value: 'PREPARING', label: 'Preparing', color: '#c2410c', bg: '#ffedd5' },
    { value: 'READY',     label: 'Ready',     color: '#15803d', bg: '#dcfce7' },
    { value: 'DELIVERED', label: 'Delivered', color: '#065f46', bg: '#d1fae5' },
    { value: 'CANCELLED', label: 'Cancelled', color: '#dc2626', bg: '#fee2e2' },
  ];

  payModes = ['CASH', 'CARD', 'UPI', 'ONLINE'];

  private destroy$ = new Subject<void>();

  constructor(
    private apollo: Apollo,
    private toastr: ToastrService,
  ) {}

  ngOnInit() {}

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Called from parent ───────────────────────────────────
  openWithOrder(order: any) {
    this.order           = order;
    this.selectedStatus  = order.status;
    this.selectedPayMode = order.paymentMode;
    this.discountValue   = order.discount || 0;
  }

  // ── Computed ─────────────────────────────────────────────
  get subTotal(): number {
    return this.order?.subTotal || 0;
  }

  get tax(): number {
    return Math.round(this.subTotal * 0.05);
  }

  get grandTotal(): number {
    return Math.max(0, this.subTotal - this.discountValue + this.tax);
  }

  get isCancelling(): boolean {
    return this.selectedStatus === 'CANCELLED' && this.order?.status !== 'CANCELLED';
  }

  get isReactivating(): boolean {
    return this.order?.status === 'CANCELLED' && this.selectedStatus !== 'CANCELLED';
  }

  getStatusObj(value: string) {
    return this.statuses.find(s => s.value === value) ||
      { color: '#374151', bg: '#f3f4f6', label: value };
  }

  // ── Submit ───────────────────────────────────────────────
  submit() {
    this.isSubmitting = true;

    const input: any = {
      _id:         this.order._id,
      status:      this.selectedStatus,
      paymentMode: this.selectedPayMode,
      discount:    this.discountValue,
    };

    this.apollo.mutate({ mutation: UPDATE_ORDER, variables: { input } })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toastr.success(
            this.isCancelling      ? 'Order cancelled & inventory restored!' :
            this.isReactivating    ? 'Order re-activated & inventory deducted!' :
                                     'Order updated successfully!'
          );
          this.isSubmitting = false;
          this.saved.emit();
          this.onClose();
        },
        error: (err) => {
          console.error(err);
          this.toastr.error('Update failed');
          this.isSubmitting = false;
        },
      });
  }

  onClose() { this.close.emit(); }
}