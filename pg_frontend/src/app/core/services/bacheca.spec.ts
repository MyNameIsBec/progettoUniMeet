import { TestBed } from '@angular/core/testing';

import { Bacheca } from './bacheca';

describe('Bacheca', () => {
  let service: Bacheca;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Bacheca);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
