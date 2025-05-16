import { TestBed } from '@angular/core/testing';

import { SaveStateService } from './save-state.service';

describe('SaveStateService', () => {
  let service: SaveStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SaveStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
