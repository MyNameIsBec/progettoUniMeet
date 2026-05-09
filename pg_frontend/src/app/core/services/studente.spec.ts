import { TestBed } from '@angular/core/testing';

import { Studente } from './studente';

describe('Studente', () => {
  let service: Studente;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Studente);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
