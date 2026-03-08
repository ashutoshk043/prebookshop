import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GlobalproductvarientsComponent } from './globalproductvarients.component';

describe('GlobalproductvarientsComponent', () => {
  let component: GlobalproductvarientsComponent;
  let fixture: ComponentFixture<GlobalproductvarientsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GlobalproductvarientsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GlobalproductvarientsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
