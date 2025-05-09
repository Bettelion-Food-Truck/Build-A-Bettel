import { TestBed } from '@angular/core/testing';

import { AssetDataService } from './asset-data.service';

describe('AssetDataService', () => {
  let service: AssetDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AssetDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
