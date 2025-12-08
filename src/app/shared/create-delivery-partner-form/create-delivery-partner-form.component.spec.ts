import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateDeliveryPartnerFormComponent } from './create-delivery-partner-form.component';

describe('CreateDeliveryPartnerFormComponent', () => {
  let component: CreateDeliveryPartnerFormComponent;
  let fixture: ComponentFixture<CreateDeliveryPartnerFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateDeliveryPartnerFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CreateDeliveryPartnerFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
