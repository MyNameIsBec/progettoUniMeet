import { TestBed } from '@angular/core/testing';

import { Mappa } from './mappa';

describe('Mappa', () => {
  let service: Mappa;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Mappa);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
