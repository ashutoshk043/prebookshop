import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VarientFormComponent } from './varient-form.component';

describe('VarientFormComponent', () => {
  let component: VarientFormComponent;
  let fixture: ComponentFixture<VarientFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VarientFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VarientFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
