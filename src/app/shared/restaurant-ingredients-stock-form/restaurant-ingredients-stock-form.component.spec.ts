import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RestaurantIngredientsStockFormComponent } from './restaurant-ingredients-stock-form.component';

describe('RestaurantIngredientsStockFormComponent', () => {
  let component: RestaurantIngredientsStockFormComponent;
  let fixture: ComponentFixture<RestaurantIngredientsStockFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RestaurantIngredientsStockFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RestaurantIngredientsStockFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
