import { TestBed } from '@angular/core/testing';

import { Prenotazione } from './prenotazione';

describe('Prenotazione', () => {
  let service: Prenotazione;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Prenotazione);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
