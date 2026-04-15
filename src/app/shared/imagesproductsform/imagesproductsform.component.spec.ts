import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImagesproductsformComponent } from './imagesproductsform.component';

describe('ImagesproductsformComponent', () => {
  let component: ImagesproductsformComponent;
  let fixture: ComponentFixture<ImagesproductsformComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImagesproductsformComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ImagesproductsformComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
