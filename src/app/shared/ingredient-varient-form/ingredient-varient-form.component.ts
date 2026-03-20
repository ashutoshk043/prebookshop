import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Apollo } from 'apollo-angular';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { NgSelectModule } from '@ng-select/ng-select';                        // ✅
import { ADD_RECIPE, UPDATE_RECIPE } from '../../graphql/ingredient-varient-recipe/mutation';
import { GET_PRODUCT_VARIANTS } from '../../graphql/globalproductvarients/product-variant-query';
import { GET_INGREDIENTS } from '../../graphql/ingredientmanagement/ingredientmanagement.query';

@Component({
  selector: 'app-ingredient-varient-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgSelectModule],               // ✅
  templateUrl: './ingredient-varient-form.component.html',
  styleUrl: './ingredient-varient-form.component.css'
})
export class IngredientVarientFormComponent implements OnInit {

  @Output() close = new EventEmitter<void>();

  recipeForm!: FormGroup;
  mode: 'add' | 'edit' = 'add';
  recipeId: string | null = null;
  disableClientFilter = (_: string, _item: any) => true;

  // ── Variants ────────────────────────────────────────────
  productVarients: any[] = [];
  variantPage = 1;
  variantSearch = '';
  isLoadingVariants = false;
  variantHasMore = true;
  private variantSearchSubject = new Subject<string>();

  // ── Ingredients ─────────────────────────────────────────
  ingredients: any[] = [];
  ingredientPage = 1;
  ingredientSearch = '';
  isLoadingIngredients = false;
  ingredientHasMore = true;
  private ingredientSearchSubject = new Subject<string>();

  constructor(
    private fb: FormBuilder,
    private apollo: Apollo,
    private toastr: ToastrService
  ) { }

  ngOnInit() {
    this.recipeForm = this.fb.group({
      variantId: ['', Validators.required],
      ingredientId: ['', Validators.required],
      quantity: [null, [Validators.required, Validators.min(0)]]
    });

    // ── Variant search debounce ──────────────────────────
    this.variantSearchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe((term) => {
      this.variantSearch = term;
      this.variantPage = 1;
      this.productVarients = [];
      this.variantHasMore = true;
      this.fetchVariants();
    });

    // ── Ingredient search debounce ───────────────────────
    this.ingredientSearchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe((term) => {
      this.ingredientSearch = term;
      this.ingredientPage = 1;
      this.ingredients = [];
      this.ingredientHasMore = true;
      this.fetchIngredients();
    });

    // Initial load
    this.fetchVariants();
    this.fetchIngredients();
  }

  openFormFromParent(mode: 'add' | 'edit', data?: any) {
    this.mode = mode;
    this.recipeForm.reset();

    if (mode === 'edit' && data) {
      this.recipeId = data._id;
      this.recipeForm.patchValue({
        variantId: data.variantId,
        ingredientId: data.ingredientId,
        quantity: data.quantity
      });
    }
  }

  // ── Variant fetch ────────────────────────────────────────
  fetchVariants() {
    if (!this.variantHasMore || this.isLoadingVariants) return;
    // this.isLoadingVariants = true;

    this.apollo.query({
      query: GET_PRODUCT_VARIANTS,
      variables: {
        input: {
          page: this.variantPage,
          limit: 10,
          ...(this.variantSearch ? { search: this.variantSearch } : {})
        }
      },
      fetchPolicy: 'network-only'
    }).subscribe({
      next: (result: any) => {
        const res = result?.data?.getProductVariants;
        console.log('Fetched Variants Response:', res);  // Debug log for fetched variants
        const newItems = res?.data || [];
        this.productVarients = [...this.productVarients, ...newItems];  // ← append
        this.variantHasMore = res?.hasNextPage ?? false;
        // this.variantPage++;
        // this.isLoadingVariants = false;
      },
      error: () => {
        this.toastr.error('Failed to load variants');
        this.isLoadingVariants = false;
      }
    });
  }

  // ── Ingredient fetch ─────────────────────────────────────
  fetchIngredients() {
    if (!this.ingredientHasMore || this.isLoadingIngredients) return;
    this.isLoadingIngredients = true;

    this.apollo.query({
      query: GET_INGREDIENTS,
      variables: {
        page: this.ingredientPage,
        limit: 10,
        search: this.ingredientSearch
      },
      fetchPolicy: 'network-only'
    }).subscribe({
      next: (result: any) => {
        const res = result?.data?.getIngredients;
        const newItems = res?.data || [];
        this.ingredients = [...this.ingredients, ...newItems];          // ← append
        this.ingredientHasMore = res?.hasNextPage ?? false;
        this.ingredientPage++;
        this.isLoadingIngredients = false;
      },
      error: () => {
        this.toastr.error('Failed to load ingredients');
        this.isLoadingIngredients = false;
      }
    });
  }

  // ── ng-select events ─────────────────────────────────────

  // Jab user type kare
  onVariantSearch(event: { term: string }) {
    this.variantSearchSubject.next(event.term);
  }

  onIngredientSearch(event: { term: string }) {
    this.ingredientSearchSubject.next(event.term);
  }

  // Jab dropdown open ho — reset aur fresh load
  onVariantOpen() {
    this.variantPage = 1;
    this.variantSearch = '';
    this.productVarients = [];
    this.variantHasMore = true;
    this.fetchVariants();
  }

  onIngredientOpen() {
    this.ingredientPage = 1;
    this.ingredientSearch = '';
    this.ingredients = [];
    this.ingredientHasMore = true;
    this.fetchIngredients();
  }

  // Infinite scroll — scroll end pe next page load
  onVariantScrollEnd() {
    this.fetchVariants();
  }

  onIngredientScrollEnd() {
    this.fetchIngredients();
  }

  // ── Submit ───────────────────────────────────────────────
  submitForm() {
    if (this.recipeForm.invalid) {
      this.recipeForm.markAllAsTouched();
      return;
    }


    if (this.mode === 'add') {
      this.apollo.mutate({
        mutation: ADD_RECIPE,
        variables: { input: this.recipeForm.value }
      }).subscribe({
        next: () => {
          this.toastr.success('Recipe added successfully');
          this.closeModal();
        },
        error: (err) => {
          this.toastr.error(err?.message || 'Failed to add recipe');
        }
      });

    } else {
      this.apollo.mutate({
        mutation: UPDATE_RECIPE,
        variables: { input: { id: this.recipeId, ...this.recipeForm.value } }
      }).subscribe({
        next: () => {
          this.toastr.success('Recipe updated successfully');
          this.closeModal();
        },
        error: (err) => {
          this.toastr.error(err?.message || 'Failed to update recipe');
        }
      });
    }
  }

  closeModal() {
    this.close.emit();
  }
}