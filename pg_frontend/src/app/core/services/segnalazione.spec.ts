import { TestBed } from '@angular/core/testing';

import { Segnalazione } from './segnalazione';

describe('Segnalazione', () => {
  let service: Segnalazione;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Segnalazione);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
