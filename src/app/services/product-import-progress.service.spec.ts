import { TestBed } from '@angular/core/testing';

import { ProductImportProgressService } from './product-import-progress.service';

describe('ProductImportProgressService', () => {
  let service: ProductImportProgressService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProductImportProgressService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
