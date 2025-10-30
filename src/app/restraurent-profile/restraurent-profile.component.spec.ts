import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RestraurentProfileComponent } from './restraurent-profile.component';

describe('RestraurentProfileComponent', () => {
  let component: RestraurentProfileComponent;
  let fixture: ComponentFixture<RestraurentProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RestraurentProfileComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RestraurentProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
