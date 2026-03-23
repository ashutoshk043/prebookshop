import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OffersFormComponent } from './offers-form.component';

describe('OffersFormComponent', () => {
  let component: OffersFormComponent;
  let fixture: ComponentFixture<OffersFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OffersFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OffersFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
