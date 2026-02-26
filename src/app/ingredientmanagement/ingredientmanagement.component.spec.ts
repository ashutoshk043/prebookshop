import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IngredientmanagementComponent } from './ingredientmanagement.component';

describe('IngredientmanagementComponent', () => {
  let component: IngredientmanagementComponent;
  let fixture: ComponentFixture<IngredientmanagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IngredientmanagementComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(IngredientmanagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
