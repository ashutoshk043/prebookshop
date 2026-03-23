import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RestaurantIngredientsStockComponent } from './restaurant-ingredients-stock.component';

describe('RestaurantIngredientsStockComponent', () => {
  let component: RestaurantIngredientsStockComponent;
  let fixture: ComponentFixture<RestaurantIngredientsStockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RestaurantIngredientsStockComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RestaurantIngredientsStockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
