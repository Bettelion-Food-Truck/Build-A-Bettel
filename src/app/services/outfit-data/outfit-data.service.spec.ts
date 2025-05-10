import { TestBed } from '@angular/core/testing';

import { OutfitDataService } from './outfit-data.service';

describe('OutfitDataService', () => {
  let service: OutfitDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OutfitDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
