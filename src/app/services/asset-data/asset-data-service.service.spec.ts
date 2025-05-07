import { TestBed } from '@angular/core/testing';

import { AssetDataServiceService } from './asset-data-service.service';

describe('AssetDataServiceService', () => {
  let service: AssetDataServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AssetDataServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
