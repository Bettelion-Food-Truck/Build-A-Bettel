import { TestBed } from '@angular/core/testing';

import { WebPService } from './web-p.service';

describe('WebPService', () => {
  let service: WebPService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WebPService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
