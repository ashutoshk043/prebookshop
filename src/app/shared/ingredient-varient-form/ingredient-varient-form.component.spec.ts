import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IngredientVarientFormComponent } from './ingredient-varient-form.component';

describe('IngredientVarientFormComponent', () => {
  let component: IngredientVarientFormComponent;
  let fixture: ComponentFixture<IngredientVarientFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IngredientVarientFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(IngredientVarientFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
