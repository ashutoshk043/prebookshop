import { TestBed } from '@angular/core/testing';

import { ProductImportService } from './product-import.service';

describe('ProductImportService', () => {
  let service: ProductImportService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProductImportService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
