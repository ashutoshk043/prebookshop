import { Component, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Apollo } from 'apollo-angular';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

import { LayoutsModule } from '../layouts/layouts.module';
import { HeaderComponent } from '../layouts/header/header.component';
import { CategoryFormComponent } from '../shared/category-form/category-form.component';

import { GET_INCLUDED_CATEGORIES_PAGINATED } from '../graphql/categoryManagement/query';
import { subscribe } from 'graphql';
import { ToastrService } from 'ngx-toastr';
import { DELETE_CATEGORY } from '../graphql/categoryManagement/mutation';
import { LazyImageDirective } from '../directives/lazy-image.directive';

@Component({
  selector: 'app-categorymanagement',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LayoutsModule,
    HeaderComponent,
    CategoryFormComponent,
    LazyImageDirective
  ],
  templateUrl: './categorymanagement.component.html',
  styleUrl: './categorymanagement.component.css'
})
export class CategorymanagementComponent implements OnInit, OnDestroy {

  @ViewChild(CategoryFormComponent) child!: CategoryFormComponent;

  /* ================= DATA ================= */
  categories: any[] = [];

  /* ================= UI ================= */
  showForm = false;
  isLoading = false;
  searchQuery = '';

  /* ================= PAGINATION ================= */
  currentPage = 1;
  pageSize = 10;
  total = 0;
  totalPages = 1;

  /* ================= SEARCH STREAM ================= */
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(private apollo: Apollo, private toster: ToastrService) { }

  ngOnInit(): void {

    this.getIncludedCategoriesPaginated();

    /* 🔥 Debounce Search Setup */
    this.searchSubject
      .pipe(
        debounceTime(400),          // wait 400ms
        distinctUntilChanged(),     // ignore same value
        takeUntil(this.destroy$)
      )
      .subscribe(searchTerm => {

        this.currentPage = 1;

        this.getIncludedCategoriesPaginated(
          1,
          this.pageSize,
          searchTerm
        );

      });

  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /* ================= API ================= */

  getIncludedCategoriesPaginated(
    page: number = 1,
    limit: number = 10,
    search: string = ''
  ): void {

    this.isLoading = true;

    this.apollo.query<any>({
      query: GET_INCLUDED_CATEGORIES_PAGINATED,
      variables: {
        page: page,
        limit: limit,
        search: search || null
      },
      fetchPolicy: 'network-only'
    })
      .subscribe({
        next: (res) => {

          const result = res.data?.includedCategoriesPaginated;

          if (result) {
            this.categories = result.data;

            console.log('Fetched categories:', this.categories);
            this.total = result.total;
            this.totalPages = result.totalPages;
            this.currentPage = result.currentPage;
          } else {
            this.categories = [];
          }

          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading categories:', err);
          this.isLoading = false;
        }
      });

  }

  /* ================= SEARCH ================= */

  onSearch(): void {
    this.searchSubject.next(this.searchQuery);
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.searchSubject.next('');
  }

  /* ================= PAGINATION ================= */

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.getIncludedCategoriesPaginated(
        this.currentPage + 1,
        this.pageSize,
        this.searchQuery
      );
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.getIncludedCategoriesPaginated(
        this.currentPage - 1,
        this.pageSize,
        this.searchQuery
      );
    }
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) return;

    this.getIncludedCategoriesPaginated(
      page,
      this.pageSize,
      this.searchQuery
    );
  }

  /* ================= CRUD ================= */

  openCategoryForm(mode: 'add' | 'edit', category?: any): void {
    this.showForm = true;

    setTimeout(() => {
      this.child?.openFormFromParent(mode, category);
    });
  }

  closeCategoryForm(): void {
    this.showForm = false;

    this.getIncludedCategoriesPaginated(
      this.currentPage,
      this.pageSize,
      this.searchQuery
    );
  }

  trackById(index: number, item: any): string {
    return item._id;
  }

  deleteCategory(categoryId: string): void {

    if (confirm('Are you sure you want to delete this category?')) {

      console.log('Deleting category with ID:', categoryId);

      this.apollo.mutate({
        mutation: DELETE_CATEGORY,
        variables: { id: categoryId }
      }).subscribe({
        next: () => {
          this.toster.success('Category deleted successfully');
          this.closeCategoryForm()
        },
        error: (err) => {
          this.toster.error('Failed to delete category');
          console.error('Error:', err);
        }
      });

    }

  }

}