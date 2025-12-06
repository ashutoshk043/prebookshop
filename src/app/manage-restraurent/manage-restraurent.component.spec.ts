import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageRestraurentComponent } from './manage-restraurent.component';

describe('ManageRestraurentComponent', () => {
  let component: ManageRestraurentComponent;
  let fixture: ComponentFixture<ManageRestraurentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageRestraurentComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ManageRestraurentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
