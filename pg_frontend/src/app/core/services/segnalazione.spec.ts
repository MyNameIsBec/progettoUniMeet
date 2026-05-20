import { TestBed } from '@angular/core/testing';

import { SegnalazioneService } from './segnalazione';

describe('SegnalazioneService', () => {
  let service: SegnalazioneService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SegnalazioneService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
