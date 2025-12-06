import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageDeliveryPartnersComponent } from './manage-delivery-partners.component';

describe('ManageDeliveryPartnersComponent', () => {
  let component: ManageDeliveryPartnersComponent;
  let fixture: ComponentFixture<ManageDeliveryPartnersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageDeliveryPartnersComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ManageDeliveryPartnersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
