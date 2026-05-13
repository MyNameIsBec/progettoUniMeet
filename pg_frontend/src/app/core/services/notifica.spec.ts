import { TestBed } from '@angular/core/testing';

import { NotificaService } from './notifica';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('NotificaService', () => {
  let service: NotificaService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [NotificaService]
    });
    service = TestBed.inject(NotificaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
