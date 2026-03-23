import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderEditFormComponent } from './order-edit-form.component';

describe('OrderEditFormComponent', () => {
  let component: OrderEditFormComponent;
  let fixture: ComponentFixture<OrderEditFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderEditFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OrderEditFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
