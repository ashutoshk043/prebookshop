import { Component, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Apollo } from 'apollo-angular';

import { LayoutsModule } from '../layouts/layouts.module';
import { HeaderComponent } from '../layouts/header/header.component';
import { CategoryFormComponent } from '../shared/category-form/category-form.component';

import { GET_ALL_CATEGORIES } from '../graphql/categoryManagement/query';

@Component({
  selector: 'app-categorymanagement',
  standalone: true,
  imports: [
    CommonModule,
    LayoutsModule,
    HeaderComponent,
    CategoryFormComponent
  ],
  templateUrl: './categorymanagement.component.html',
  styleUrl: './categorymanagement.component.css'
})
export class CategorymanagementComponent implements OnInit {

  @ViewChild(CategoryFormComponent) child!: CategoryFormComponent;

  /* ================= DATA ================= */
  allCategories: any[] = [];   // 🔒 master list (API)
  categories: any[] = [];      // 👀 current page UI list

  /* ================= UI ================= */
  showForm = false;
  isLoading = false;

  /* ================= PAGINATION ================= */
  currentPage = 1;
  pageSize = 15;

  /* ================= SORT ================= */
  sortField: 'order' = 'order';          // ✅ default icon visible
  sortDirection: 'asc' | 'desc' = 'asc';

  constructor(private apollo: Apollo) {}

  ngOnInit(): void {
    this.getAllCategories();
  }

  /* ================= PAGINATION ================= */

  get totalRecords(): number {
    return this.allCategories.length;
  }

  get totalPages(): number {
    return Math.ceil(this.totalRecords / this.pageSize);
  }

  get visiblePages(): number[] {
    const range = 2;
    const start = Math.max(1, this.currentPage - range);
    const end = Math.min(this.totalPages, this.currentPage + range);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  applyPagination(): void {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;

    this.categories = this.allCategories.slice(start, end);

    // ✅ page change ke baad bhi sorting rahe
    this.applySortingOnCurrentPage();
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.applyPagination();
  }

  /* ================= SORTING ================= */

  sortByOrder(): void {
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';

    // ❌ page reset nahi hoga
    this.applySortingOnCurrentPage();
  }

  private applySortingOnCurrentPage(): void {
    this.categories = [...this.categories].sort((a, b) => {
      const aVal = a.order ?? 0;
      const bVal = b.order ?? 0;

      return this.sortDirection === 'asc'
        ? aVal - bVal
        : bVal - aVal;
    });
  }

  /* ================= API ================= */

  getAllCategories(): void {
    this.isLoading = true;

    this.apollo.query<any>({
      query: GET_ALL_CATEGORIES,
      fetchPolicy: 'network-only'
    }).subscribe({
      next: (res) => {
        this.allCategories = [...res.data.categories];

        this.currentPage = 1;
        this.applyPagination();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('GraphQL Error:', err);
        this.isLoading = false;
      }
    });
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
    this.getAllCategories();
  }

  deleteCategory(id: string): void {
    if (!confirm('Are you sure you want to delete this category?')) return;

    this.allCategories = this.allCategories.filter(c => c._id !== id);

    if ((this.currentPage - 1) * this.pageSize >= this.allCategories.length) {
      this.currentPage = Math.max(1, this.currentPage - 1);
    }

    this.applyPagination();
  }

  trackById(index: number, item: any): string {
  return item._id;
}
}