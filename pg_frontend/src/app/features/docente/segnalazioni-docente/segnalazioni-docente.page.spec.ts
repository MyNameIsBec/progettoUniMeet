import { TestBed } from '@angular/core/testing';
import { SegnalazioniDocentePage } from './segnalazioni-docente.page';

describe('SegnalazioniDocentePage', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SegnalazioniDocentePage],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(SegnalazioniDocentePage);
    const page = fixture.componentInstance;
    expect(page).toBeTruthy();
  });
});
