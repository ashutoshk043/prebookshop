import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IngredientVarientRecipeComponent } from './ingredient-varient-recipe.component';

describe('IngredientVarientRecipeComponent', () => {
  let component: IngredientVarientRecipeComponent;
  let fixture: ComponentFixture<IngredientVarientRecipeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IngredientVarientRecipeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(IngredientVarientRecipeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
