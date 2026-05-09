import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PrenotazioniRicevutePage } from './prenotazioni-ricevute.page';

describe('PrenotazioniRicevutePage', () => {
  let component: PrenotazioniRicevutePage;
  let fixture: ComponentFixture<PrenotazioniRicevutePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PrenotazioniRicevutePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
