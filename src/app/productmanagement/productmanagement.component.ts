import {
  Component,
  OnInit,
  ViewChild,
  OnDestroy,
  ChangeDetectorRef
} from '@angular/core';

import { SidebarComponent } from "../layouts/sidebar/sidebar.component";
import { HeaderComponent } from "../layouts/header/header.component";
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Apollo } from 'apollo-angular';

import { debounceTime, distinctUntilChanged, Subject, Subscription } from 'rxjs';

import { ProductManagementFormComponent } from "../shared/product-management-form/product-management-form.component";

import { SEARCH_PRODUCTS } from '../graphql/productmanagement/product-query';
import { DELETE_PRODUCT } from '../graphql/productmanagement/product-mutaion';
import { GET_ALL_CATEGORIES_FORM, GET_INCLUDED_CATEGORIES_PAGINATED } from '../graphql/categoryManagement/query';

export interface Product {
  _id: string;
  name: string;
  slug: string;
  categoryId: string;
  description: string;
  imageUrl: string | null;
  varients: ('')[];
  isVeg: boolean;
  isActive: boolean;
  isOnlineVisible: boolean;
  createdAt: string;
  updatedAt: string;
  category?: {
    id: string;
    name: string;
  };
}

@Component({
  selector: 'app-productmanagement',
  standalone: true,
  imports: [
    SidebarComponent,
    HeaderComponent,
    CommonModule,
    ReactiveFormsModule,
    ProductManagementFormComponent
  ],
  templateUrl: './productmanagement.component.html',
  styleUrl: './productmanagement.component.css'
})
export class ProductmanagementComponent implements OnInit, OnDestroy {

  showForm = false;

  @ViewChild(ProductManagementFormComponent)
  child!: ProductManagementFormComponent;

  products: Product[] = [];

  currentPage = 1;
  limit = 10;
  totalItems = 0;
  totalPages = 0;

  searchName = '';

  productsLoading = false;

  // categories: any[] = [];

  private searchSubject = new Subject<string>();
  private searchSub!: Subscription;

  constructor(
    private apollo: Apollo,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {

    this.getAllProducts();
    // this.getIncludedCategoriesPaginated();

    this.searchSub = this.searchSubject
      .pipe(
        debounceTime(400),
        distinctUntilChanged()
      )
      .subscribe((value) => {
        this.searchName = value;
        this.currentPage = 1;
        this.getAllProducts();
      });

  }

  ngOnDestroy(): void {
    this.searchSub?.unsubscribe();
  }

  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value.trim();
    this.searchSubject.next(value);
  }


  getAllProducts(): void {

    this.productsLoading = true;

    this.apollo.query({
      query: SEARCH_PRODUCTS,
      variables: {
        name: this.searchName || undefined,
        page: this.currentPage,
        limit: this.limit
      },
      fetchPolicy: 'no-cache'
    }).subscribe({

      next: (res: any) => {

        const result = res.data?.searchProducts;

        if (result) {

          this.products = result.data || [];

          console.log(this.products, "products are here")

          this.totalItems = result.total || 0;
          this.currentPage = result.page || 1;
          this.limit = result.limit || 10;

          this.totalPages = Math.ceil(this.totalItems / this.limit) || 1;

        } else {

          this.products = [];
          this.totalPages = 0;

        }

        this.productsLoading = false;

      },

      error: () => {

        this.toastr.error('Failed to load products');
        this.productsLoading = false;

      }

    });

  }

  openAddForm(mode: 'add' | 'edit', productData?: any): void {

    this.showForm = true;

    this.cdr.detectChanges();

    if (this.child) {
      this.child.openFormFromParent(mode, productData);
    }

  }

  closeForm(): void {

    this.showForm = false;

    this.currentPage = 1;

    this.getAllProducts();

  }

  goToPage(page: number): void {

    if (page < 1 || page > this.totalPages) return;

    this.currentPage = page;

    this.getAllProducts();

  }

  nextPage(): void {

    if (this.currentPage < this.totalPages) {
      this.goToPage(this.currentPage + 1);
    }

  }

  prevPage(): void {

    if (this.currentPage > 1) {
      this.goToPage(this.currentPage - 1);
    }

  }

  get pages(): number[] {

    return Array.from(
      { length: this.totalPages },
      (_, i) => i + 1
    );

  }

  deleteProduct(id: string): void {

    if (!confirm('Are you sure?')) return;

    this.apollo.mutate({

      mutation: DELETE_PRODUCT,
      variables: { _id: id }

    }).subscribe({

      next: () => {

        this.products = this.products.filter(p => p._id !== id);

        this.toastr.success('Product Deleted');

        this.getAllProducts();

      },

      error: () => {

        this.toastr.error('Failed to delete');

      }

    });

  }

  trackByProductId(index: number, product: Product): string {

    return product._id;

  }

}