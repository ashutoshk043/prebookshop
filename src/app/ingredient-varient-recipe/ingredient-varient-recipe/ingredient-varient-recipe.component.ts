import { Component, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { Apollo } from 'apollo-angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

import { LayoutsModule } from '../../layouts/layouts.module';
import { IngredientVarientFormComponent } from '../../shared/ingredient-varient-form/ingredient-varient-form.component';

import { GET_RECIPES } from '../../graphql/ingredient-varient-recipe/query';
import { DELETE_RECIPE } from '../../graphql/ingredient-varient-recipe/mutation';
import { HeaderComponent } from "../../layouts/header/header.component";

@Component({
  selector: 'app-ingredient-varient-recipe',
  standalone: true,
  imports: [
    LayoutsModule,
    CommonModule,
    FormsModule,
    IngredientVarientFormComponent,
    HeaderComponent
],
  templateUrl: './ingredient-varient-recipe.component.html',
  styleUrls: ['./ingredient-varient-recipe.component.css']
})
export class IngredientVarientRecipeComponent implements OnInit, OnDestroy {

  // ── Form ────────────────────────────────────────────────
  showForm = false;
  @ViewChild(IngredientVarientFormComponent) child!: IngredientVarientFormComponent;

  // ── Data ────────────────────────────────────────────────
  recipes: any[] = [];
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
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(
    private apollo: Apollo,
    private toastr: ToastrService
  ) {}

  ngOnInit() {

    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.currentPage = 1;
      this.loadRecipes();
    });

    this.loadRecipes();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearchChange(value: string) {
    this.searchTerm = value;
    this.searchSubject.next(value);
  }

  loadRecipes() {

    this.isLoading = true;

    this.apollo.watchQuery({
      query: GET_RECIPES,
      variables: {
        page: this.currentPage,
        limit: this.limit,
        search: this.searchTerm
      },
      fetchPolicy: 'network-only'
    })
    .valueChanges
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (res: any) => {

        const result = res.data.getRecipes;

        this.recipes = result.data;
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

  deleteRecipe(id: string) {

    if (!confirm('Are you sure you want to delete this recipe?')) return;

    this.apollo.mutate({
      mutation: DELETE_RECIPE,
      variables: { id }
    })
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: () => {
        this.toastr.success('Recipe deleted successfully');
        this.loadRecipes();
      },
      error: (err) => {
        console.error('Delete error', err);
        this.toastr.error('Failed to delete recipe');
      }
    });
  }

  goToPage(page: number) {

    if (page < 1 || page > this.totalPages) return;

    this.currentPage = page;
    this.loadRecipes();
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  getSerial(index: number): number {
    return (this.currentPage - 1) * this.limit + index + 1;
  }

  openRecipeForm(mode: 'add' | 'edit', data?: any) {

    this.showForm = true;

    setTimeout(() => {
      if (this.child) {
        this.child.openFormFromParent(mode, data);
      }
    });
  }

  closeRecipeForm() {
    this.showForm = false;
    this.loadRecipes();
  }
}