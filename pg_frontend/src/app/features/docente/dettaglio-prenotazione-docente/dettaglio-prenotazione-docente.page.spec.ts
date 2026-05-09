import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DettaglioPrenotazioneDocentePage } from './dettaglio-prenotazione-docente.page';

describe('DettaglioPrenotazioneDocentePage', () => {
  let component: DettaglioPrenotazioneDocentePage;
  let fixture: ComponentFixture<DettaglioPrenotazioneDocentePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DettaglioPrenotazioneDocentePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
