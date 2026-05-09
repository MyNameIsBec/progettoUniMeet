import { TestBed } from '@angular/core/testing';

import { Notifica } from './notifica';

describe('Notifica', () => {
  let service: Notifica;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Notifica);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
