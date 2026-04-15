import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LogoBannerFormComponent } from './logo-banner-form.component';

describe('LogoBannerFormComponent', () => {
  let component: LogoBannerFormComponent;
  let fixture: ComponentFixture<LogoBannerFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LogoBannerFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LogoBannerFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
