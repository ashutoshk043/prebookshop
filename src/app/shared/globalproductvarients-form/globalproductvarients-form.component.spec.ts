import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GlobalproductvarientsFormComponent } from './globalproductvarients-form.component';

describe('GlobalproductvarientsFormComponent', () => {
  let component: GlobalproductvarientsFormComponent;
  let fixture: ComponentFixture<GlobalproductvarientsFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GlobalproductvarientsFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GlobalproductvarientsFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
