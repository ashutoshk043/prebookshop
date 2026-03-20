import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RestaurantVariantPriceComponent } from './restaurent-varient-price.component';

describe('RestaurentVarientPriceComponent', () => {
  let component: RestaurantVariantPriceComponent;
  let fixture: ComponentFixture<RestaurantVariantPriceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RestaurantVariantPriceComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RestaurantVariantPriceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
