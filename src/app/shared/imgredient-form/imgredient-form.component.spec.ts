import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImgredientFormComponent } from './imgredient-form.component';

describe('ImgredientFormComponent', () => {
  let component: ImgredientFormComponent;
  let fixture: ComponentFixture<ImgredientFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImgredientFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ImgredientFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
