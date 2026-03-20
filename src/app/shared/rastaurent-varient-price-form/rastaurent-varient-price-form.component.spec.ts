import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RestaurantVariantPriceFormComponent } from './rastaurent-varient-price-form.component';

describe('RestaurantVariantPriceFormComponent', () => {
  let component: RestaurantVariantPriceFormComponent;
  let fixture: ComponentFixture<RestaurantVariantPriceFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RestaurantVariantPriceFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RestaurantVariantPriceFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
