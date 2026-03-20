// ingredientmanagement.component.ts
import { Component, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { Apollo } from 'apollo-angular';
import { GET_INGREDIENTS } from '../graphql/ingredientmanagement/ingredientmanagement.query';
import { LayoutsModule } from "../layouts/layouts.module";
import { HeaderComponent } from "../layouts/header/header.component";
import { ImgredientFormComponent } from "../shared/imgredient-form/imgredient-form.component";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { DELETE_INGREDIENT } from '../graphql/ingredientmanagement/ingredientmanagement.mutation';

@Component({
  selector: 'app-ingredientmanagement',
  standalone: true,
  imports: [LayoutsModule, HeaderComponent, ImgredientFormComponent, CommonModule, FormsModule],
  templateUrl: './ingredientmanagement.component.html',
  styleUrl: './ingredientmanagement.component.css'
})
export class IngredientmanagementComponent implements OnInit, OnDestroy {

  // ── Form ────────────────────────────────────────────────
  showForm = false;
  @ViewChild(ImgredientFormComponent) child!: ImgredientFormComponent;

  // ── Data ────────────────────────────────────────────────
  ingredients: any[] = [];
  isLoading = false;

  // ── Pagination ──────────────────────────────────────────
  currentPage = 1;
  limit = 10;
  total = 0;
  totalPages = 0;
  hasNextPage = false;
  hasPrevPage = false;

  // ── Search ──────────────────────────────────────────────
  searchTerm = '';
  private searchSubject = new Subject<string>();   // ← debounce pipeline
  private destroy$ = new Subject<void>();          // ← memory leak rokne ke liye

  constructor(private apollo: Apollo, private toastr: ToastrService) { }

  ngOnInit() {
    // ✅ 400ms baad hi search trigger hoga — DB hits kam hoge
    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged(),        // same value dobara ho toh skip
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.currentPage = 1;          // search par page 1 pe reset
      this.loadIngredients();
    });

    this.loadIngredients();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Input se call hoga ──────────────────────────────────
  onSearchChange(value: string) {
    this.searchSubject.next(value);
  }

  loadIngredients() {
    this.isLoading = true;

    this.apollo.watchQuery({
      query: GET_INGREDIENTS,
      variables: {
        page: this.currentPage,
        limit: this.limit,
        search: this.searchTerm  // ✅ search pass karo
      },
      fetchPolicy: 'network-only'
    }).valueChanges.pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        const result = res.data.getIngredients;
        this.ingredients = result.data;
        this.total = result.total;
        this.totalPages = result.totalPages;
        this.hasNextPage = result.hasNextPage;
        this.hasPrevPage = result.hasPrevPage;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Fetch error', err);
        this.isLoading = false;
      }
    });
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.loadIngredients();
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  getSerial(index: number): number {
    return (this.currentPage - 1) * this.limit + index + 1;
  }

  openIngredientForm(mode: 'add' | 'edit', data?: any) {
    this.showForm = true;
    setTimeout(() => {
      if (this.child) this.child.openFormFromParent(mode, data);
    });
  }

  closeIngredientForm() {
    this.showForm = false;
    this.loadIngredients();
  }

  deleteIngredient(id: string) {
    if (!confirm('Are you sure you want to delete this ingredient?')) return;

    this.apollo.mutate({
      mutation: DELETE_INGREDIENT,
      variables: { id }
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.toastr.success('Ingredient deleted successfully');
        this.loadIngredients();
      },
      error: (err) => {
        console.error('Delete error', err);
        this.toastr.error('Failed to delete ingredient');
      }
    });
  }
}