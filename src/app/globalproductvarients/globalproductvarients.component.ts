import { Component, OnInit, ViewChild, Pipe, PipeTransform } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Apollo, gql } from 'apollo-angular';
import { ToastrService } from 'ngx-toastr';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';

import { GET_PRODUCT_VARIANTS } from '../graphql/globalproductvarients/product-variant-query';
import { GlobalproductvarientsFormComponent } from '../shared/globalproductvarients-form/globalproductvarients-form.component';
import { HeaderComponent } from '../layouts/header/header.component';
import { SidebarComponent } from '../layouts/sidebar/sidebar.component';

// ─── Inline Pipe ─────────────────────────────────────────────────────────────
@Pipe({ name: 'min', standalone: true })
export class MinPipe implements PipeTransform {
  transform(values: number[]): number {
    return Math.min(...values);
  }
}

// ─── Inline Mutation ──────────────────────────────────────────────────────────
const DELETE_PRODUCT_VARIANT = gql`
  mutation DeleteProductVariant($id: String!) {
    deleteProductVariant(id: $id)
  }
`;

// ─── Component ────────────────────────────────────────────────────────────────
@Component({
  selector: 'app-globalproductvarients',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SidebarComponent,
    HeaderComponent,
    GlobalproductvarientsFormComponent,
    MinPipe
  ],
  templateUrl: './globalproductvarients.component.html',
  styleUrl: './globalproductvarients.component.css'
})
export class GlobalproductvarientsComponent implements OnInit {

  @ViewChild(GlobalproductvarientsFormComponent)
  formRef!: GlobalproductvarientsFormComponent;

  // UI state
  showForm  = false;
  isLoading = false;

  // Data
  productVarients: any[] = [];

  // Pagination
  currentPage  = 1;
  pageSize     = 10;
  totalRecords = 0;
  totalPages   = 0;
  hasNextPage  = false;
  hasPrevPage  = false;

  // Search
  searchTerm = '';
  private searchSubject = new Subject<string>();

  constructor(
    private apollo: Apollo,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.getAllProductVariants();

    this.searchSubject
      .pipe(debounceTime(400), distinctUntilChanged())
      .subscribe((term) => {
        this.currentPage = 1;
        this.getAllProductVariants(1, this.pageSize, term);
      });
  }

  // ─── Fetch ──────────────────────────────────────────────────────────────────
  getAllProductVariants(page: number = 1, limit: number = 10, search?: string) {
    this.isLoading = true;
    this.apollo.query({
      query: GET_PRODUCT_VARIANTS,
      variables: {
        input: { page, limit, ...(search ? { search } : {}) }
      },
      fetchPolicy: 'network-only'
    })
    .subscribe({
      next: (result: any) => {
        const response         = result?.data?.getProductVariants;
        this.productVarients   = response?.data        || [];
        this.totalRecords      = response?.total       ?? 0;
        this.currentPage       = response?.page        ?? 1;
        this.totalPages        = response?.totalPages  ?? 0;
        this.hasNextPage       = response?.hasNextPage ?? false;
        this.hasPrevPage       = response?.hasPrevPage ?? false;
        this.isLoading = false;
      },
      error: (err) => {
        this.toastr.error('Failed to load variants');
        console.error('Fetch error:', err);
        this.isLoading = false;
      }
    });
  }

  // ─── Search ─────────────────────────────────────────────────────────────────
  onSearch(term: string) {
    this.searchSubject.next(term);
  }

  // ─── Pagination ─────────────────────────────────────────────────────────────
  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.getAllProductVariants(page, this.pageSize, this.searchTerm);
  }

  nextPage() {
    if (this.hasNextPage) this.goToPage(this.currentPage + 1);
  }

  prevPage() {
    if (this.hasPrevPage) this.goToPage(this.currentPage - 1);
  }

  onPageSizeChange() {
    this.currentPage = 1;
    this.getAllProductVariants(1, this.pageSize, this.searchTerm);
  }

  getPagesArray(): number[] {
    const maxVisible = 5;
    let start = Math.max(1, this.currentPage - 2);
    let end   = Math.min(this.totalPages, start + maxVisible - 1);
    if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  // ─── Form ───────────────────────────────────────────────────────────────────
  openAddForm(mode: 'add' | 'edit', data?: any) {
    this.showForm = true;
    setTimeout(() => this.formRef?.openFormFromParent(mode, data), 0);
  }

  closeForm() {
    this.showForm = false;
    this.getAllProductVariants(this.currentPage, this.pageSize, this.searchTerm);
  }

  // ─── Delete ─────────────────────────────────────────────────────────────────
  deleteVariant(id: string): void {
    if (!confirm('Are you sure you want to delete this variant?')) return;

    this.apollo.mutate({
      mutation: DELETE_PRODUCT_VARIANT,
      variables: { id }
    }).subscribe({
      next: () => {
        this.toastr.success('Variant deleted successfully');
        if (this.productVarients.length === 1 && this.currentPage > 1) {
          this.currentPage--;
        }
        this.getAllProductVariants(this.currentPage, this.pageSize, this.searchTerm);
      },
      error: (err) => {
        const message = err?.graphQLErrors?.[0]?.message || 'Failed to delete variant';
        this.toastr.error(message);
        console.error('Delete error:', err);
      }
    });
  }
}