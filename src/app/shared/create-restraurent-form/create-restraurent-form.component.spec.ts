import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateRestraurentFormComponent } from './create-restraurent-form.component';

describe('CreateRestraurentFormComponent', () => {
  let component: CreateRestraurentFormComponent;
  let fixture: ComponentFixture<CreateRestraurentFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateRestraurentFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CreateRestraurentFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
