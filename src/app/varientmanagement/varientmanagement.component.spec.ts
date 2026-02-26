import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VarientmanagementComponent } from './varientmanagement.component';

describe('VarientmanagementComponent', () => {
  let component: VarientmanagementComponent;
  let fixture: ComponentFixture<VarientmanagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VarientmanagementComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VarientmanagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
