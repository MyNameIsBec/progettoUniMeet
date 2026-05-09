import { TestBed } from '@angular/core/testing';

import { Statistiche } from './statistiche';

describe('Statistiche', () => {
  let service: Statistiche;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Statistiche);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
